import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[Gateway] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

const allowedOrigins = [
  process.env.STOREFRONT_PROD_URL,
  process.env.ADMIN_PROD_URL,
  process.env.STOREFRONT_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:4000',
  'http://storefront-web:3000',
  'http://admin-dashboard:4000',
  'http://localhost:3000',
  'http://localhost:4000'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

// Root Route
app.get(['/', '/api'], (req, res) => {
  res.json({
    name: "Novure E-Commerce API Gateway",
    version: "1.2.3",
    status: "RUNNING",
    endpoints: {
      health: "/health",
      storefront: "/api/storefront",
      admin_management: "/api/admin/management",
      admin_storefront: "/api/admin/storefront"
    }
  });
});

const STOREFRONT_BACKEND_URL = process.env.STOREFRONT_BACKEND_URL || 'http://commerce-service:3001';
const ADMIN_BACKEND_URL = process.env.ADMIN_BACKEND_URL || 'http://admin-service:4001';
const CUSTOMER_BACKEND_URL = process.env.CUSTOMER_BACKEND_URL || 'http://customer-service:4002';

// Deep Health Check
app.get('/health', async (req, res) => {
  const checkService = async (name: string, url: string) => {
    try {
      const response = await fetch(`${url}/api/health`).catch(() => fetch(`${url}/health`));
      if (!response.ok) {
        console.error(`[Health] Service ${name} at ${url} returned ${response.status}`);
      }
      return response.ok ? 'HEALTHY' : 'UNHEALTHY';
    } catch (err: any) {
      console.error(`[Health] Service ${name} at ${url} is unreachable:`, err.message);
      return 'UNREACHABLE';
    }
  };

  const storefrontStatus = await checkService('storefront', STOREFRONT_BACKEND_URL);
  const adminStatus = await checkService('admin', ADMIN_BACKEND_URL);
  const customerStatus = await checkService('customer', CUSTOMER_BACKEND_URL);

  const isHealthy = storefrontStatus === 'HEALTHY' && adminStatus === 'HEALTHY' && customerStatus === 'HEALTHY';

  res.status(isHealthy ? 200 : 503).json({ 
    status: isHealthy ? 'UP' : 'DEGRADED', 
    timestamp: new Date().toISOString(),
    services: { 
      storefront: storefrontStatus, 
      admin: adminStatus,
      customer: customerStatus
    } 
  });
});

const proxyOptions = (target: string) => ({
  target,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      if (req.headers.cookie) {
        proxyReq.setHeader('cookie', req.headers.cookie);
      }
      console.log(`[Proxy] ${req.method} ${req.url} -> ${target}${proxyReq.path}`);
    },
    error: (err: any, req: any, res: any) => {
      console.error(`Proxy Error (${target}):`, err);
      res.status(502).json({ success: false, error: 'Bad Gateway' });
    }
  }
});

// --- Proxy Routing Configuration (Ordered by Specificity) ---

// 1. Customer Service Proxy (No path rewrite needed as paths match perfectly)
app.use(createProxyMiddleware({
  pathFilter: [
    '/api/storefront/auth/**',
    '/api/storefront/account/**',
    '/api/storefront/cart/**',
    '/api/storefront/checkout/**',
    '/api/storefront/orders/**',
    '/api/storefront/shipping/**'
  ],
  ...proxyOptions(CUSTOMER_BACKEND_URL)
}));

// 2. Admin Service Proxy (Neon Dashboard Logic)
app.use(createProxyMiddleware({
  pathFilter: [
    '/api/admin/management/**',
    '/api/admin/storefront/orders/**',
    '/api/admin/storefront/customers/**',
    '/api/admin/storefront/analytics/**'
  ],
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 3. Catalog Admin Proxy (Supabase)
// /api/admin/storefront/products -> /api/admin/products
app.use(createProxyMiddleware({
  pathFilter: '/api/admin/storefront/**',
  ...proxyOptions(STOREFRONT_BACKEND_URL),
  pathRewrite: { '^/api/admin/storefront': '/api/admin' }
}));

// 4. Catalog Storefront Proxy (Supabase - Products/Categories)
// /api/storefront/products -> /api/products
app.use(createProxyMiddleware({
  pathFilter: '/api/storefront/**',
  ...proxyOptions(STOREFRONT_BACKEND_URL),
  pathRewrite: { '^/api/storefront': '/api' }
}));

// Catch-all for unmatched /api routes
app.use('/api', (req, res) => {
  console.warn(`[Gateway] Unmatched API Route: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.url} not found`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway v1.2.3 running at port ${PORT}`);
});
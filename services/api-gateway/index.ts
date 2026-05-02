import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  process.env.STOREFRONT_PROD_URL,
  process.env.ADMIN_PROD_URL,
  process.env.STOREFRONT_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:4000',
  'http://storefront-web:3000',
  'http://admin-dashboard:4000'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Root Route
app.get(['/', '/api'], (req, res) => {
  res.json({
    name: "Novure E-Commerce API Gateway",
    version: "1.2.1",
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
  const checkService = async (url: string) => {
    try {
      const response = await fetch(`${url}/api/health`).catch(() => fetch(`${url}/health`));
      return response.ok ? 'HEALTHY' : 'UNHEALTHY';
    } catch {
      return 'UNREACHABLE';
    }
  };

  const storefrontStatus = await checkService(STOREFRONT_BACKEND_URL);
  const adminStatus = await checkService(ADMIN_BACKEND_URL);
  const customerStatus = await checkService(CUSTOMER_BACKEND_URL);

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
  onProxyReq: (proxyReq: any, req: any) => {
    if (req.headers.cookie) {
      proxyReq.setHeader('cookie', req.headers.cookie);
    }
    // Add debug log to see where requests are going
    console.log(`[Proxy] ${req.method} ${req.url} -> ${target}${proxyReq.path}`);
  },
  onError: (err: any, req: any, res: any) => {
    console.error(`Proxy Error (${target}):`, err);
    res.status(502).json({ success: false, error: 'Bad Gateway' });
  }
});

// --- Proxy Routing Configuration (Order Matters!) ---

// 1. Logistics & Shipping APIs -> Admin Service (Neon)
app.use(createProxyMiddleware({
  pathFilter: ['/api/storefront/shipping', '/api/admin/management/shipping'],
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 2. Midtrans Notification (Special handling to ensure it hits Admin Service)
app.use(createProxyMiddleware({
  pathFilter: '/api/storefront/checkout/midtrans/notification',
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 3. Storefront Transaction/Identity APIs -> Customer Service
app.use(createProxyMiddleware({
  pathFilter: [
    '/api/storefront/auth', 
    '/api/storefront/account', 
    '/api/storefront/cart', 
    '/api/storefront/checkout'
  ],
  ...proxyOptions(CUSTOMER_BACKEND_URL)
}));

// 4. Storefront Orders -> Admin Service (Neon)
app.use(createProxyMiddleware({
  pathFilter: '/api/storefront/orders',
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 5. Admin Analytics & Management -> Admin Service (Neon)
app.use(createProxyMiddleware({
  pathFilter: [
    '/api/admin/storefront/orders', 
    '/api/admin/storefront/customers', 
    '/api/admin/storefront/analytics',
    '/api/admin/management'
  ],
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 6. Admin Catalog APIs (Products/Categories) -> Core Commerce API (Supabase)
// Re-maps /api/admin/storefront/products -> /api/admin/products
app.use(createProxyMiddleware({
  pathFilter: '/api/admin/storefront',
  pathRewrite: { '^/api/admin/storefront': '/api/admin' },
  ...proxyOptions(STOREFRONT_BACKEND_URL)
}));

// 7. Storefront Catalog APIs (Default Catalog) -> Core Commerce API (Supabase)
// Re-maps /api/storefront/products -> /api/products
app.use(createProxyMiddleware({
  pathFilter: '/api/storefront',
  pathRewrite: { '^/api/storefront': '/api' },
  ...proxyOptions(STOREFRONT_BACKEND_URL)
}));

// Catch-all for unmatched /api routes
app.use('/api', (req, res) => {
  console.warn(`[Gateway] Unmatched API Route: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.url} not found`,
    available_endpoints: {
      storefront: "/api/storefront",
      admin_management: "/api/admin/management",
      admin_storefront: "/api/admin/storefront"
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway v1.2.1 running at port ${PORT}`);
});

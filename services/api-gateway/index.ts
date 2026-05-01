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
    version: "1.2.0",
    status: "RUNNING",
    endpoints: {
      health: "/health",
      storefront: "/api/storefront",
      admin_management: "/api/admin/management",
      admin_storefront: "/api/admin/storefront"
    }
  });
});

const STOREFRONT_BACKEND_URL = process.env.STOREFRONT_BACKEND_URL || 'http://core-commerce-api:3001';
const ADMIN_BACKEND_URL = process.env.ADMIN_BACKEND_URL || 'http://admin-management-api:4001';

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

  const isHealthy = storefrontStatus === 'HEALTHY' && adminStatus === 'HEALTHY';

  res.status(isHealthy ? 200 : 503).json({ 
    status: isHealthy ? 'UP' : 'DEGRADED', 
    timestamp: new Date().toISOString(),
    services: { 
      storefront: storefrontStatus, 
      admin: adminStatus 
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
  },
  onError: (err: any, req: any, res: any) => {
    console.error(`Proxy Error (${target}):`, err);
    res.status(502).json({ success: false, error: 'Bad Gateway' });
  }
});

// --- Proxy Routing Configuration ---
// Note: We use pathFilter to ensure full paths are preserved when proxying.
// Plain strings act as prefix matches in HPM v3.

// 1. Logistics & Shipping APIs (Route to Admin Management API)
app.use(createProxyMiddleware({
  pathFilter: ['/api/storefront/shipping', '/api/admin/management/shipping'],
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 2. Storefront Transaction/Identity APIs -> Route to Admin Management API (Neon)
app.use(createProxyMiddleware({
  pathFilter: [
    '/api/storefront/auth', 
    '/api/storefront/account', 
    '/api/storefront/cart', 
    '/api/storefront/checkout', 
    '/api/storefront/orders'
  ],
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 3. Admin Transactional APIs (Orders/Customers/Analytics) -> Route to Admin Management API (Neon)
app.use(createProxyMiddleware({
  pathFilter: [
    '/api/admin/storefront/orders', 
    '/api/admin/storefront/customers', 
    '/api/admin/storefront/analytics'
  ],
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 4. Admin Management API (Internal stuff like Staff, Audit)
app.use(createProxyMiddleware({
  pathFilter: '/api/admin/management',
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 5. Storefront Catalog APIs -> Route to Core Commerce API (Supabase)
app.use(createProxyMiddleware({
  pathFilter: '/api/storefront',
  pathRewrite: { '^/api/storefront': '/api' },
  ...proxyOptions(STOREFRONT_BACKEND_URL)
}));

// 6. Admin Catalog APIs (Products/Categories - Redirects to Core API)
app.use(createProxyMiddleware({
  pathFilter: '/api/admin/storefront',
  pathRewrite: { '^/api/admin/storefront': '/api/admin' },
  ...proxyOptions(STOREFRONT_BACKEND_URL)
}));

// Catch-all for unmatched /api routes
app.use('/api', (req, res) => {  res.status(404).json({
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
  console.log(`🚀 API Gateway v1.2 running at port ${PORT}`);
});

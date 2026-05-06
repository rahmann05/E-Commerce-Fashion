import express from 'express';
import cors from 'cors';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { authenticateJWT } from './src/middlewares/auth';
import { validate } from './src/middlewares/validate';
import { loginSchema } from '@novure/contracts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  process.env.STOREFRONT_PROD_URL,
  process.env.ADMIN_PROD_URL,
  process.env.STOREFRONT_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:4000',
  'http://storefront-web:3000',
  'http://admin-dashboard:4000',
  'http://localhost:5173',
  'http://localhost:4173'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('localhost'))) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
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

// --- Proxy Options Factory (v3 syntax) ---
const proxyOptions = (target: string) => ({
  target,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      fixRequestBody(proxyReq, req);
      
      // Forward cookies
      if (req.headers.cookie) {
        proxyReq.setHeader('cookie', req.headers.cookie);
      }

      // Ensure content-type is preserved for POST requests
      if (req.headers['content-type']) {
        proxyReq.setHeader('content-type', req.headers['content-type']);
      }

      console.log(`[Proxy] ${req.method} ${req.url} -> ${target}${req.url}`);
    },
    proxyRes: (proxyRes: any, req: any, res: any) => {
      // Forward set-cookie headers back to client
      const sc = proxyRes.headers['set-cookie'];
      if (sc) {
        res.setHeader('set-cookie', sc);
      }
    },
    error: (err: any, req: any, res: any) => {
      console.error(`[Proxy Error] ${req.method} ${req.url}:`, err.message);
      res.status(502).json({
        success: false,
        error: 'Gateway encountered a connection error with the backend service.'
      });
    }
  }
});

// --- Proxy Rules ---

// 1. Logistics & Shipping APIs
app.use(createProxyMiddleware({
  pathFilter: ['/api/storefront/shipping'],
  ...proxyOptions(CUSTOMER_BACKEND_URL)
}));

app.use(createProxyMiddleware({
  pathFilter: ['/api/admin/management/shipping'],
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 2. Admin Management APIs -> Admin Service (Neon)
app.use(
  '/api/admin/management',
  authenticateJWT,
  createProxyMiddleware({
    pathRewrite: { '^/api/admin/management': '/api/admin/management' },
    ...proxyOptions(ADMIN_BACKEND_URL)
  })
);

// 3. Storefront Identity/Auth APIs -> Customer Service (Neon)
// 3a. Protected routes
app.use(
  [
    '/api/storefront/auth/me',
    '/api/storefront/account',
    '/api/storefront/cart',
    '/api/storefront/checkout',
    '/api/storefront/orders'
  ],
  authenticateJWT,
  createProxyMiddleware(proxyOptions(CUSTOMER_BACKEND_URL))
);

// 3b. Unprotected routes with validation
app.use('/api/storefront/auth/login', validate(loginSchema), createProxyMiddleware(proxyOptions(CUSTOMER_BACKEND_URL)));
app.use('/api/storefront/auth/register', createProxyMiddleware(proxyOptions(CUSTOMER_BACKEND_URL)));
app.use('/api/storefront/auth/logout', createProxyMiddleware(proxyOptions(CUSTOMER_BACKEND_URL)));

// 4. Admin Dashboard Auth -> Admin Service (Neon)
app.use('/api/admin/auth/login', validate(loginSchema), createProxyMiddleware({
  pathRewrite: { '^/api/admin/auth': '/api/admin/management/auth' },
  ...proxyOptions(ADMIN_BACKEND_URL)
}));
app.use('/api/admin/auth/logout', createProxyMiddleware({
  pathRewrite: { '^/api/admin/auth': '/api/admin/management/auth' },
  ...proxyOptions(ADMIN_BACKEND_URL)
}));
app.use('/api/admin/auth/me', authenticateJWT, createProxyMiddleware({
  pathRewrite: { '^/api/admin/auth': '/api/admin/management/auth' },
  ...proxyOptions(ADMIN_BACKEND_URL)
}));

// 5. Admin Dashboard APIs for Storefront Data (Orders, Analytics) -> Admin Service (Neon)
app.use(
  [
    '/api/admin/storefront/orders',
    '/api/admin/storefront/analytics'
  ],
  authenticateJWT,
  createProxyMiddleware(proxyOptions(ADMIN_BACKEND_URL))
);

// 6. Storefront Catalog APIs for Admin (mapped to /api/admin/storefront) -> Commerce Service (Supabase)
app.use(
  '/api/admin/storefront',
  authenticateJWT,
  createProxyMiddleware({
    pathRewrite: { '^/api/admin/storefront': '/api/admin' },
    ...proxyOptions(STOREFRONT_BACKEND_URL)
  })
);

// 6. Generic Storefront API (Products, Categories) -> Commerce Service (Supabase)
app.use(createProxyMiddleware({
  pathFilter: '/api/storefront',
  pathRewrite: { '^/api/storefront': '/api' },
  ...proxyOptions(STOREFRONT_BACKEND_URL)
}));

// 7. Geography API -> Emsifa
app.use(
  '/api/geography',
  createProxyMiddleware({
    target: 'https://www.emsifa.com',
    changeOrigin: true,
    pathRewrite: { '^/api/geography': '/api-wilayah-indonesia/api' }
  })
);

// Error handling for unmatched routes
app.use((req, res) => {
  console.warn(`[Gateway] 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, error: 'Route not found in Gateway' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
  console.log(`Commerce Service: ${STOREFRONT_BACKEND_URL}`);
  console.log(`Admin Service: ${ADMIN_BACKEND_URL}`);
  console.log(`Customer Service: ${CUSTOMER_BACKEND_URL}`);
});

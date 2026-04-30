import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  process.env.STOREFRONT_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:4000'
];

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

app.use(express.json());

const STOREFRONT_BACKEND_URL = process.env.STOREFRONT_BACKEND_URL || 'http://localhost:3001';
const ADMIN_BACKEND_URL = process.env.ADMIN_BACKEND_URL || 'http://localhost:4001';

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

// 1. Storefront Public API
// In HPM v3, the mount path '/api/storefront' is stripped from req.url before proxying.
// So '/api/storefront/products' → proxy gets '/products'.
// We set target to include '/api' so it becomes 'http://localhost:3001/api/products'.
app.use('/api/storefront', createProxyMiddleware({
  ...proxyOptions(`${STOREFRONT_BACKEND_URL}/api`),
}));

// 2. Admin Transactional API (Redirects to Core API's admin routes)
app.use('/api/admin/storefront', createProxyMiddleware({
  ...proxyOptions(`${STOREFRONT_BACKEND_URL}/api/admin`),
}));

// 3. Admin Management API (Redirects to Management API for internal stuff)
app.use('/api/admin/management', createProxyMiddleware({
  ...proxyOptions(`${ADMIN_BACKEND_URL}/api`),
}));

app.listen(PORT, () => {
  console.log(`🚀 API Gateway v1.2 running at port ${PORT}`);
});

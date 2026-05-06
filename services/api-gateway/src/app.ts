import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from '../config/env';
import routes from './routes';
import fetch from 'node-fetch';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.ALLOWED_ORIGINS.includes(origin) || (origin && origin.includes('localhost'))) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true
}));

// Body parser needed for Joi validation
app.use(express.json());

// Root Route
app.get(['/', '/api'], (req: Request, res: Response) => {
  res.json({
    name: "Novure E-Commerce API Gateway",
    version: "2.1.0",
    status: "RUNNING",
    pattern: "Modular BFF Architecture"
  });
});

// Deep Health Check
app.get('/health', async (req: Request, res: Response) => {
  const checkService = async (url: string) => {
    try {
      const response = await fetch(`${url}/api/health`).catch(() => fetch(`${url}/health`));
      return response.ok ? 'HEALTHY' : 'UNHEALTHY';
    } catch {
      return 'UNREACHABLE';
    }
  };

  const storefrontStatus = await checkService(env.COMMERCE_SERVICE_URL);
  const adminStatus = await checkService(env.ADMIN_SERVICE_URL);
  const customerStatus = await checkService(env.CUSTOMER_SERVICE_URL);

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

// Register all routes
app.use('/api', routes);

// Error handling for unmatched routes
app.use((req: Request, res: Response) => {
  console.warn(`[Gateway] 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, error: 'Route not found in Gateway' });
});

export default app;

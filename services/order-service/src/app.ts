import express from 'express';
import { createCorsMiddleware, errorHandler } from '@novarium/shared';
import { env } from './config/env.js';
import orderRoutes from './routes/order.routes.js';

const app = express();

app.use(createCorsMiddleware(env.ALLOWED_ORIGINS));
app.use(express.json());

// Root Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'order-service' });
});

// Routes
app.use('/api/orders', orderRoutes);

// Error Handler
app.use(errorHandler);

export default app;

import express from 'express';
import { createCorsMiddleware, errorHandler } from '@novarium/shared';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/account.js';
import cartRoutes from './routes/cart.js';
import checkoutRoutes from './routes/checkout.js';
import orderRoutes from './routes/orders.js';

const app = express();

app.use(createCorsMiddleware(env.ALLOWED_ORIGINS));
app.use(express.json());

// Root Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'customer-service' });
});

// Routes
app.use('/api/customer/auth', authRoutes);
app.use('/api/customer/account', accountRoutes);
app.use('/api/customer/cart', cartRoutes);
app.use('/api/customer/checkout', checkoutRoutes);
app.use('/api/customer/orders', orderRoutes);

// Error Handler
app.use(errorHandler);

export default app;

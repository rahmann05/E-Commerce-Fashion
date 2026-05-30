import express from 'express';
import { createCorsMiddleware, errorHandler } from '@novarium/shared';
import { env } from './config/env.js';
import routes from './routes/index.js';

const app = express();

app.use(createCorsMiddleware(env.ALLOWED_ORIGINS));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'admin-service' });
});

// Routes — semua di bawah /api/admin
app.use('/api/admin', routes);

// Error Handler
app.use(errorHandler);

export default app;

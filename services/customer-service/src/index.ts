import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import accountRoutes from './routes/account';
import orderRoutes from './routes/orders';
import shippingRoutes from './routes/shipping';
import cartRoutes from './routes/cart';
import checkoutRoutes from './routes/checkout';

dotenv.config();

const app = express();
app.use(cookieParser());

const allowedOrigins = [
  process.env.STOREFRONT_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:4000',
  'http://localhost:8000', // API Gateway
  'http://api-gateway:8000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('localhost'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

app.use('/api/storefront/auth', authRoutes);
app.use('/api/storefront/account', accountRoutes);
app.use('/api/storefront/orders', orderRoutes);
app.use('/api/storefront/shipping', shippingRoutes);
app.use('/api/storefront/cart', cartRoutes);
app.use('/api/storefront/checkout', checkoutRoutes);

app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'UP', service: 'customer-service' });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Global Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`🚀 Customer Service running on port ${PORT}`);
});
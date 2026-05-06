import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import accountRoutes from './routes/account';
import cartRoutes from './routes/cart';
import checkoutRoutes from './routes/checkout';
import orderRoutes from './routes/orders';
import shippingRoutes from './routes/shipping';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Root Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'customer-service' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/account', accountRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/orders', orderRoutes);
app.use('/shipping', shippingRoutes);

export default app;

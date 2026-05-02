import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import accountRoutes from './routes/account';
import orderRoutes from './routes/orders';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/storefront/auth', authRoutes);
app.use('/api/storefront/account', accountRoutes);
app.use('/api/storefront/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'customer-service' });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`🚀 Customer Service running on port ${PORT}`);
});
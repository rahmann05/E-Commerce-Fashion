import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/storefront/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'customer-api-service' });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`🚀 Customer API Service running on port ${PORT}`);
});
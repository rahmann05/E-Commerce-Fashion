import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || 'novure-super-secret-key-2026',
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY || 'novure-internal-mesh-key-2026',
  COMMERCE_SERVICE_URL: process.env.STOREFRONT_BACKEND_URL || 'http://commerce-service:3001',
  ADMIN_SERVICE_URL: process.env.ADMIN_BACKEND_URL || 'http://admin-service:4001',
  CUSTOMER_SERVICE_URL: process.env.CUSTOMER_BACKEND_URL || 'http://customer-service:4002',
  ALLOWED_ORIGINS: [
    process.env.STOREFRONT_PROD_URL,
    process.env.ADMIN_PROD_URL,
    process.env.STOREFRONT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:4000',
    'http://localhost:5173',
    'http://localhost:4173'
  ].filter(Boolean) as string[]
};

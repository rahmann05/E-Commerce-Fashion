import dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '../../../.env') });
}

export const env = {
  PORT: process.env.PORT || 4001,
  DATABASE_URL: process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'novarium-super-secret-key-2026',
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY || 'novarium-internal-mesh-key-2026',
  ALLOWED_ORIGINS: [
    process.env.STOREFRONT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:4000',
  ]
};

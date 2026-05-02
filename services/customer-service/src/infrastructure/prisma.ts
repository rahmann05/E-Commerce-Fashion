import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let connectionString = process.env.DATABASE_URL || '';
if (!connectionString.includes('sslmode=')) {
  const separator = connectionString.includes('?') ? '&' : '?';
  connectionString += `${separator}sslmode=no-verify`;
} else if (connectionString.includes('sslmode=require')) {
  connectionString = connectionString.replace('sslmode=require', 'sslmode=no-verify');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

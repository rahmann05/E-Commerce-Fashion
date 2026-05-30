import { defineConfig } from '@prisma/config';
import { env } from 'process';

export default defineConfig({
  earlyAccess: true,
  studio: {
    port: 5558,
  },
  migrations: {
    url: env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/order_db?schema=public',
  },
});

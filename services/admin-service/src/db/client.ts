import { PrismaClient } from "@novarium/admin-prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// For local development, inject the URL into process.env before PrismaClient initializes
if (!process.env.DATABASE_URL && process.env.ADMIN_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.ADMIN_DATABASE_URL;
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
export default prisma;

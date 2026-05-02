import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const prismaClientSingleton = () => {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
  }
  
  // Ensure SSL mode is no-verify for Neon/cloud databases to avoid self-signed cert errors
  if (!connectionString.includes('sslmode=')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString = `${connectionString}${separator}sslmode=no-verify`;
  } else if (connectionString.includes('sslmode=require')) {
    connectionString = connectionString.replace('sslmode=require', 'sslmode=no-verify');
  }
  
  // Safeguard: Auto-correct common Supabase connection typos (e.g., postgrees -> postgres)
  // Check both database name and protocol segments
  if (connectionString.includes('postgrees')) {
    console.warn("⚠️ CRITICAL: Detected typo 'postgrees' in DATABASE_URL. Force-correcting to 'postgres'...");
    connectionString = connectionString.split('postgrees').join('postgres');
  }
  
  if (connectionString.includes('suppabase')) {
    console.warn("⚠️ CRITICAL: Detected typo 'suppabase' in DATABASE_URL. Force-correcting to 'supabase'...");
    connectionString = connectionString.split('suppabase').join('supabase');
  }
  
  console.log("🔌 Initializing Prisma Client with DATABASE_URL (Cleaned):", connectionString.split('@')[1] || "HIDDEN");
  
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;


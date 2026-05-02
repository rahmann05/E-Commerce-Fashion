require('dotenv').config();
const { Client } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (connectionString.includes('sslmode=require')) {
  connectionString = connectionString.replace('sslmode=require', 'sslmode=no-verify');
} else if (!connectionString.includes('sslmode=')) {
  const separator = connectionString.includes('?') ? '&' : '?';
  connectionString += `${separator}sslmode=no-verify`;
}
connectionString = connectionString.replace('postgrees', 'postgres').replace('suppabase', 'supabase');

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "colors" TEXT[] DEFAULT ARRAY[]::TEXT[];');
    await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sizeOptions" TEXT[] DEFAULT ARRAY[]::TEXT[];');
    await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sizeStocks" INTEGER[] DEFAULT ARRAY[]::INTEGER[];');
    await client.query('ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "size" TEXT;');
    await client.query('ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "color" TEXT;');
    console.log('Columns added successfully');
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
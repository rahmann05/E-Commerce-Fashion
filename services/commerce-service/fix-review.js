require('dotenv').config();
const { Client } = require('pg');

let connectionString = process.env.DATABASE_URL;
connectionString = connectionString.replace('sslmode=require', 'sslmode=no-verify').replace('postgrees', 'postgres').replace('suppabase', 'supabase');

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    
    // Check columns
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Review';");
    console.log('COLUMNS IN Review:', res.rows.map(r => r.column_name).join(', '));
    
    // Add missing column
    if (!res.rows.find(r => r.column_name === 'orderId')) {
      console.log('Adding orderId column...');
      await client.query('ALTER TABLE "Review" ADD COLUMN "orderId" TEXT;');
      console.log('Column added.');
    } else {
      console.log('orderId column already exists.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
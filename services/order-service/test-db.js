import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const pool = new Pool({ connectionString: process.env.ADMIN_DATABASE_URL });
pool.query(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema='public';
`).then(res => {
  console.log(res.rows);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

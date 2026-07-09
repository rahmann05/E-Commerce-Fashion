import { PrismaClient } from "@novarium/order-prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const connectionString = process.env.ADMIN_DATABASE_URL;
console.log("Using DB:", connectionString);
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const orders = await prisma.order.findMany({ include: { items: true } });
    console.log("Orders:", orders);
  } catch (err) {
    console.error("FULL ERROR:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();

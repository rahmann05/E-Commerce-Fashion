require("dotenv").config({ path: "../../.env" });
const { PrismaClient } = require("@novarium/order-prisma");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

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

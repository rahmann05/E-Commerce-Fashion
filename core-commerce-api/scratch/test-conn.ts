import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function test() {
  try {
    const categories = await prisma.category.findMany();
    console.log("Success! Categories count:", categories.length);
  } catch (e) {
    console.error("Connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();

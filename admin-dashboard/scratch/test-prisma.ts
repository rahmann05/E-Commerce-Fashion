import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

async function main() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log("Success! Found users:", users.length);
  } catch (err) {
    console.error("Failed to initialize Prisma Client:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

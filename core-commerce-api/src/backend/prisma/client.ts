import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prismaClientSingleton = () => {
  console.log("🔌 Initializing Prisma Client with DATABASE_URL:", process.env.DATABASE_URL?.split('@')[1] || "UNDEFINED");
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

import { defineConfig } from "@prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
    // @ts-expect-error - Prisma config type might not support directUrl yet
    directUrl: process.env.DIRECT_URL,
  },
});

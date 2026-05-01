import { defineConfig } from "@prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // @ts-expect-error - Prisma config type doesn't support directUrl property
    directUrl: process.env.DIRECT_URL,
  },
});

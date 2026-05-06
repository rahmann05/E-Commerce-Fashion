import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
    // @ts-expect-error - directUrl might not be fully typed
    directUrl: process.env.DIRECT_URL,
  },
});

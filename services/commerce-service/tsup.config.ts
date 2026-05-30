import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  platform: 'node',
  external: [
    '@novarium/commerce-prisma',
    '@prisma/client',
    '@prisma/adapter-pg',
    '@prisma/config',
    '@prisma/client-runtime-utils',
  ],
  noExternal: ['@novarium/contracts'],
});

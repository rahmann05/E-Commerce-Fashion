import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts'
  },
  format: ['cjs'],
  clean: true,
  platform: 'node',
  external: [
    '@novarium/admin-prisma',
    '@prisma/client',
    '@prisma/adapter-pg',
    '@prisma/config',
    '@prisma/client-runtime-utils',
  ],
  noExternal: ['@novarium/database'],
});

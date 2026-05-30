# API Gateway ESM Compatibility and Env Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix ESM compatibility issues in API Gateway and Contracts package, and standardize environment variable loading in the Gateway.

**Architecture:** Add `type: module` and `exports` to `@novarium/contracts`, update API Gateway start script to use `tsx`, and align environment variable names with project standards.

**Tech Stack:** Node.js, ESM, tsx, npm workspaces.

---

### Task 1: Update Contracts Package for ESM

**Files:**
- Modify: `packages/contracts/package.json`

- [ ] **Step 1: Add type: module and exports field**

```json
{
  "name": "@novarium/contracts",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "joi": "^17.13.3"
  },
  "devDependencies": {
    "typescript": "^5.x.x"
  }
}
```

- [ ] **Step 2: Verify package.json structure**
Check if the file is valid JSON and contains the new fields.

### Task 2: Standardize API Gateway Environment Variables

**Files:**
- Modify: `services/api-gateway/config/env.ts`

- [ ] **Step 1: Update env object to use standardized variable names**

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || 'novarium-super-secret-key-2026',
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY || 'novarium-internal-mesh-key-2026',
  COMMERCE_SERVICE_URL: process.env.COMMERCE_SERVICE_URL || 'http://commerce-service:3001',
  ADMIN_SERVICE_URL: process.env.ADMIN_SERVICE_URL || 'http://admin-service:4001',
  CUSTOMER_SERVICE_URL: process.env.CUSTOMER_SERVICE_URL || 'http://customer-service:4002',
  SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL || 'https://ghdadhlyhzdkrjlurifj.supabase.co',
  ALLOWED_ORIGINS: [
    process.env.STOREFRONT_PROD_URL,
    process.env.ADMIN_PROD_URL,
    process.env.STOREFRONT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:4000',
    'http://localhost:5173',
    'http://localhost:4173'
  ].filter(Boolean) as string[]
};
```

### Task 3: Update API Gateway Start Script

**Files:**
- Modify: `services/api-gateway/package.json`

- [ ] **Step 1: Update start script to use npx tsx**

```json
{
  "name": "api-gateway",
  "version": "1.0.0",
  "main": "index.ts",
  "type": "module",
  "scripts": {
    "dev": "tsx index.ts",
    "start": "npx tsx index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "@novarium/contracts": "*",
    "cookie": "^1.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "http-proxy-middleware": "^3.0.3",
    "joi": "^17.13.3",
    "jsonwebtoken": "^9.0.3",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "@types/cookie": "^0.6.0",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^24.0.0",
    "ts-node": "^10.9.2",
    "tsx": "^4.19.3",
    "typescript": "^5.8.2"
  }
}
```

### Task 4: Final Verification

- [ ] **Step 1: Run type check in api-gateway**
Run: `cd services/api-gateway && npx tsc --noEmit`
Expected: No errors related to `@novarium/contracts` imports.

- [ ] **Step 2: Check start command**
Run: `cd services/api-gateway && npm run start -- --help` (or similar to check if it boots)
Note: This might fail if other services aren't running, but we can check if it starts without ESM errors.

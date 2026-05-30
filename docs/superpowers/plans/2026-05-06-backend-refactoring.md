# Backend Services Modular Refactoring Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `commerce-service` and `admin-service` into pure Node.js/Express BFF architectures, removing Next.js and SvelteKit remnants. Align with the established `src/modules/` architecture.
**Architecture:** Pure Express with controllers, services, routes, and dtos. Shared database from `@novarium/database`.
**Tech Stack:** Node.js, Express, TypeScript

---

### Task 1: Clean Up Framework Remnants and Install Express

**Files:**
- Modify: `services/commerce-service/package.json`
- Modify: `services/admin-service/package.json`
- Delete: `services/commerce-service/app/`, `services/commerce-service/next.config.ts`, `services/admin-service/src/routes/`, `services/admin-service/svelte.config.js`, `services/admin-service/vite.config.ts`

- [ ] **Step 1: Install Express in Commerce Service**
Run `npm install express cors` and `npm install --save-dev @types/express @types/cors` in `services/commerce-service`.
Remove `next`, `react`, `react-dom`.

- [ ] **Step 2: Install Express in Admin Service**
Run `npm install express cors` and `npm install --save-dev @types/express @types/cors` in `services/admin-service`.
Remove `@sveltejs/kit`, `vite`, `svelte`.

- [ ] **Step 3: Remove Frontend Files**
Delete the old framework files and folders in both services to ensure pure backend structure.

### Task 2: Setup Commerce Service Express App

**Files:**
- Create: `services/commerce-service/src/app.ts`
- Create: `services/commerce-service/src/index.ts`
- Modify: `services/commerce-service/src/modules/product/product.routes.ts`

- [ ] **Step 1: Create Express App**
Create `app.ts` to initialize Express, CORS, and JSON parsing.

- [ ] **Step 2: Create Modular Routes**
Create route files for `product`, `category`, `review`, `shipping`, `analytics`, and `health` in their respective module folders. Wire them to the existing controllers.

- [ ] **Step 3: Wire Routes to App**
Import module routes into `app.ts`. Setup `index.ts` to listen on port 3001.

### Task 3: Setup Admin Service Express App

**Files:**
- Create: `services/admin-service/src/app.ts`
- Create: `services/admin-service/src/index.ts`
- Modify: `services/admin-service/src/modules/order/order.routes.ts`

- [ ] **Step 1: Create Express App**
Create `app.ts` to initialize Express, CORS, and JSON parsing.

- [ ] **Step 2: Create Modular Routes**
Create route files for `order`, `auth`, and `shipping` in their respective module folders. Wire them to the existing controllers.

- [ ] **Step 3: Wire Routes to App**
Import module routes into `app.ts`. Setup `index.ts` to listen on port 4000.

### Task 4: Build and Start Configurations

**Files:**
- Modify: `services/commerce-service/package.json`
- Modify: `services/admin-service/package.json`

- [ ] **Step 1: Update Scripts**
Update `dev` and `build` scripts in both services to use `tsx` or `ts-node` for running the Express apps directly.
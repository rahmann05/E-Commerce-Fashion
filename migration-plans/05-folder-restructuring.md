# Phase 5: Folder Restructuring & Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align folder structures with headless architecture, atomic design, and centralize API contracts (OpenAPI + Joi).
**Architecture:** Strict separation of concerns. UI apps use feature/atomic structure. Backend services use module structure. OpenAPI contracts and Joi schemas are centralized in a shared package.
**Tech Stack:** Monorepo, React, SvelteKit, Express, OpenAPI, Joi

---

### Task 1: Setup Shared Contracts Package (OpenAPI & Joi)

**Files:**
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/openapi/common.yaml`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/contracts/src/schemas/product.joi.ts`

- [ ] **Step 1: Initialize Contracts Package**
Create `packages/contracts`. Setup `package.json` with `joi` dependency and configure it as a workspace package (`@novure/contracts`).

- [ ] **Step 2: Define OpenAPI Specs**
Copy the recommended OpenAPI specification from `PANDUAN_HASIL_ANALISIS.md` into `openapi/common.yaml`.

- [ ] **Step 3: Define Shared Joi Schemas**
Create Joi schemas that strictly match the OpenAPI definitions (e.g., `ProductSchema`, `CartItemSchema`, `OrderSchema`) in `src/schemas/`. Export them all from `src/index.ts`.

- [ ] **Step 4: Update Gateway to use Shared Schemas**
Update `api-gateway` to import Joi schemas from `@novure/contracts` for its validation middleware instead of defining them locally.

### Task 2: Restructure Storefront-web (Atomic Design)

**Files:**
- Modify: `apps/storefront-web/src/frontend/components`

- [ ] **Step 1: Atomic Design Folders**
Create `atoms`, `molecules`, `organisms` inside `apps/storefront-web/src/frontend/components/`. Move primitive UI components (buttons, inputs, animated text) into `atoms` or `ui`.

- [ ] **Step 2: Feature Folders**
Create `features/catalog`, `features/cart`, `features/auth` inside `apps/storefront-web/src/frontend/`. Move domain-specific components here. Ensure imports are updated across the app.

### Task 3: Restructure Admin-web (Modular)

**Files:**
- Modify: `apps/admin-web/src/`

- [ ] **Step 1: Apply modular structure**
Create `components/` and `features/` under `src/`. Move UI components to `components/` and domain logic to `features/`.

### Task 4: Restructure Commerce & Admin Services (API Modules)

**Files:**
- Modify: `services/commerce-service/`
- Modify: `services/admin-service/`

- [ ] **Step 1: Apply Module Pattern**
Create `src/modules/product/` in `commerce-service`. Move route logic from Next.js route handlers (`app/api/...`) to controller functions inside `src/modules/product/product.controller.ts`. Ensure these controllers conform to the OpenAPI contracts defined in `@novure/contracts`.

- [ ] **Step 2: Migrate Admin Service**
Create `src/modules/order/` in `admin-service`. Move route logic from SvelteKit `+server.ts` files into standard Node.js controllers. Ensure data output matches the Joi/OpenAPI schemas.
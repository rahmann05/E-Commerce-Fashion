# Phase 2: Gateway Centralization & Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the API Gateway the single entry point with centralized JWT authentication and strict Joi-based payload validation.
**Architecture:** API Gateway acts as the auth verification and request validation layer. It validates incoming requests using Joi schemas (derived from OpenAPI specs) before proxying to downstream services.
**Tech Stack:** Node.js, Express, jsonwebtoken, joi, http-proxy-middleware

---

### Task 1: Install Gateway Dependencies

**Files:**
- Modify: `services/api-gateway/package.json`

- [ ] **Step 1: Install packages**
Run `npm install jsonwebtoken joi` and `npm install --save-dev @types/jsonwebtoken` in the `services/api-gateway` directory.

### Task 2: Implement Centralized JWT Authentication Middleware

**Files:**
- Create: `services/api-gateway/src/middlewares/auth.ts`
- Modify: `services/api-gateway/index.ts`

- [ ] **Step 1: Create auth middleware**
Write a middleware function using `jsonwebtoken` that reads the `novure_jwt` cookie or `Authorization: Bearer` header, verifies it using `process.env.JWT_SECRET`, and attaches the decoded payload (e.g. `req.user`) and sets a `x-user-id` header for downstream services. Return `401 Unauthorized` if invalid.

- [ ] **Step 2: Apply auth middleware**
In `index.ts`, apply this middleware to protect all `/api/storefront/auth/me`, `/api/storefront/cart`, `/api/storefront/orders`, and all `/api/admin/*` routes (except admin login).

### Task 3: Implement Joi Validation Middleware

**Files:**
- Create: `services/api-gateway/src/middlewares/validate.ts`
- Create: `services/api-gateway/src/schemas/auth.schema.ts`
- Modify: `services/api-gateway/index.ts`

- [ ] **Step 1: Create validation middleware factory**
Write a middleware `validate(schema)` that validates `req.body`, `req.query`, and `req.params` against a provided Joi schema. If validation fails, return `400 Bad Request` with the Joi error details.

- [ ] **Step 2: Create initial Joi schemas**
Create basic Joi schemas in `auth.schema.ts` for login (`email` required, `password` required). *(Note: Comprehensive schemas will be moved to the shared contracts package in Phase 5).*

- [ ] **Step 3: Apply validation**
Apply the Joi validation middleware to the `/api/storefront/auth/login` and `/api/admin/auth/login` proxy routes.

### Task 4: Move Storefront JWT to Cookies

**Files:**
- Modify: `apps/storefront-web/src/frontend/lib/auth.ts`
- Modify: `apps/storefront-web/src/frontend/context/CartContext.tsx`

- [ ] **Step 1: Update auth.ts**
Remove `localStorage.setItem` and `getItem` for `novure_jwt`. The gateway/auth service must now return a `Set-Cookie: novure_jwt=...; HttpOnly` header on successful login.

- [ ] **Step 2: Update CartContext.tsx**
Remove all `localStorage` token reads. Let the browser send the cookie automatically with `credentials: 'include'` on all fetch calls.

### Task 5: Proxy Geography API

**Files:**
- Modify: `services/api-gateway/index.ts`
- Modify: `apps/storefront-web/src/frontend/lib/api/geography.ts`

- [ ] **Step 1: Add gateway route for emsifa**
Add a proxy rule in `api-gateway/index.ts` for `/api/geography` pointing to `https://www.emsifa.com/api-wilayah-indonesia/api`.

- [ ] **Step 2: Update frontend fetch**
Change `BASE_URL` in `geography.ts` to hit `/api/geography` instead of the external URL directly.
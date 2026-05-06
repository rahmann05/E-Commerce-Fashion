# Phase 1: Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate immediate security vulnerabilities and backend bypasses.
**Architecture:** Direct database clients in frontend are removed. Mock credentials in source are deleted. JWT secrets are moved to environment variables. Webhook endpoints receive signature verification. Admin routes in backend receive basic auth guards.
**Tech Stack:** Node.js, Next.js, SvelteKit, Express

---

### Task 1: Remove Supabase Client from Admin Web

**Files:**
- Modify: `apps/admin-web/src/lib/supabase.ts` (Delete)
- Modify: `docker-compose.yml` (Remove Supabase env vars from admin-web)

- [ ] **Step 1: Delete supabase.ts**
Delete the file `apps/admin-web/src/lib/supabase.ts`.

- [ ] **Step 2: Update docker-compose.yml for admin-web**
Remove `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` from `apps/admin-web` environment section.

### Task 3: Remove Mock Users from Storefront Web

**Files:**
- Modify: `apps/storefront-web/src/frontend/lib/mock-users.ts` (Delete)
- Modify: `apps/storefront-web/src/frontend/context/AuthContext.tsx`

- [ ] **Step 1: Delete mock-users.ts**
Delete the file `apps/storefront-web/src/frontend/lib/mock-users.ts`.

- [ ] **Step 2: Refactor AuthContext.tsx**
Remove imports and references to `mock-users.ts`.

### Task 4: Secure JWT Secret

**Files:**
- Modify: `docker-compose.yml`
- Modify: `services/customer-service/src/middleware/auth.ts`

- [ ] **Step 1: Update docker-compose.yml JWT_SECRET**
Replace plaintext `novure-super-secret-key-2026` with `${JWT_SECRET}`. Add `JWT_SECRET` to `.env` file if applicable.

- [ ] **Step 2: Update customer-service auth.ts**
Ensure `JWT_SECRET` uses `process.env.JWT_SECRET` properly rather than a hardcoded default string.

### Task 5: Add Midtrans Signature Verification

**Files:**
- Modify: `services/customer-service/src/routes/checkout.ts`

- [ ] **Step 1: Add verification logic**
In the Midtrans webhook handler, use crypto to verify the SHA512 signature using `order_id`, `status_code`, `gross_amount`, and `SERVER_KEY`. Return 401 if invalid.

### Task 6: Secure Commerce Service Admin Routes

**Files:**
- Modify: `services/commerce-service/app/api/admin/products/route.ts`

- [ ] **Step 1: Add auth guard**
Add a check for an admin API key or JWT header before allowing POST/PUT/DELETE operations. Return 401 Unauthorized if missing.
# Headless Architecture Migration Design

## 1. Overview
The current E-Commerce repository suffers from architectural drift, specifically violating the Headless Architecture design pattern. Frontend applications contain direct database connections, backend services are built using fullstack frameworks but acting as APIs, authentication is fragmented, and directory structures are inconsistent. 

This design outlines a 5-phase migration plan to enforce strict Headless Architecture, centralize the API Gateway, secure the systems, and restructure the monorepo directories.

## 2. Approach
The migration is divided into 5 isolated phases. This decomposition ensures that each piece can be executed and validated independently, minimizing risk. 

Detailed step-by-step plans will be generated for each phase in the `migration-plans/` directory at the root of the project.

### Phase 1: Security Hardening (Immediate)
**Goal:** Eliminate immediate security vulnerabilities and backend bypasses.
- **Admin-web:** Remove `apps/admin-web/src/lib/supabase.ts` (direct Supabase client). Replace usages with gateway API calls.
- **Storefront-web:** Delete `apps/storefront-web/src/frontend/lib/mock-users.ts` (plaintext passwords) and refactor `AuthContext`.
- **Global:** Rotate the hardcoded JWT secret (`novure-super-secret-key-2026`) across `docker-compose.yml`, `customer-service`, and `admin-service` to use environment variables safely.
- **Customer-service:** Implement Midtrans webhook signature verification in `checkout.ts`.
- **Commerce-service:** Add authentication guards to admin routes (`app/api/admin/products/route.ts`, etc.).

### Phase 2: Gateway Centralization
**Goal:** Make the API Gateway the single entry point with centralized authentication.
- **API Gateway:** Add centralized JWT verification middleware.
- **Storefront-web:** Move JWT storage from XSS-vulnerable `localStorage` to `httpOnly` cookies.
- **Gateway Proxying:** Proxy the external geography API (`emsifa.com`) through the gateway instead of calling it directly from the frontend.

### Phase 3: Schema and Database Consolidation
**Goal:** Resolve duplicate database schemas between overlapping services.
- **Admin-service & Customer-service:** Consolidate the duplicated Prisma schemas (since they share the same database). Establish one schema owner.
- **Commerce-service:** Clean up unused Supabase environment variables from `docker-compose.yml`.

### Phase 4: Service Mesh Cleanup
**Goal:** Fix inefficient queries and circular dependencies in internal service-to-service communication.
- **Admin-service:** Fix circular dependency where admin-service calls gateway back to itself for cart services. It should call `commerce-service` directly.
- **Customer-service:** Fix N+1 queries in cart hydration by adding a batch fetch endpoint (`/api/products?ids=...`) in `commerce-service`.

### Phase 5: Folder Restructuring
**Goal:** Align folder structures with the headless architecture and atomic design patterns.
- **Storefront-web:** Restructure into Atomic Design (`components/atoms`, `molecules`, `organisms`) and Feature-based modules (`features/catalog`, `features/cart`, `features/checkout`).
- **Admin-web:** Restructure SvelteKit application to match modular standards.
- **Commerce-service & Admin-service:** Strip out remnants of fullstack frameworks (Next.js/SvelteKit used purely as APIs) and restructure into pure Node.js REST APIs using `src/modules/` architecture.
- **Monorepo Root:** Implement a shared `packages/contracts` folder containing OpenAPI specs.

## 3. Data Flow
- **Client -> API Gateway:** All client traffic (storefront and admin UI) must hit the API Gateway.
- **API Gateway -> Services:** The Gateway verifies JWT/auth, then routes traffic to `commerce-service`, `customer-service`, or `admin-service`.
- **Service -> Service:** Internal communication bypasses the Gateway but communicates directly via Docker service hostnames (e.g., `customer-service` calls `commerce-service:3001`).

## 4. Error Handling & Testing
- Every phase must pass existing linting and build checks before moving to the next.
- For API route changes, test the endpoints to ensure they still return the expected JSON structure.
- For Security changes (JWT, Webhooks), ensure requests lacking proper credentials are unambiguously rejected (401/403).

## 5. Next Steps
Once this design is approved, we will invoke the `writing-plans` skill to generate the detailed implementation checklists inside the `migration-plans/` directory for each phase, starting with Phase 1.
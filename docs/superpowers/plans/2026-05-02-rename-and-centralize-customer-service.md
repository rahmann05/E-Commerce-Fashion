# Rename to Customer Service & Centralize Customer Logic Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename `customer-api-service` to `customer-service` and migrate remaining storefront-facing customer logic (Orders, Shipping Track) from `admin-service` to this centralized service.

**Architecture:** A unified Express.js `customer-service` that handles all Storefront logic for customers. The API Gateway will be updated to point all `/api/storefront` traffic (except products) to this service.

**Tech Stack:** Express.js, TypeScript, Prisma, JWT.

---

### Task 1: Updating Service Naming & Metadata

**Files:**
- Modify: `services/customer-service/package.json`
- Modify: `services/customer-service/src/index.ts`
- Modify: `docker-compose.yml`
- Modify: `services/api-gateway/index.ts`

- [ ] **Step 1: Update package.json name**
```json
{
  "name": "@novure/customer-service"
}
```

- [ ] **Step 2: Update index.ts health response**
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'customer-service' });
});
```

- [ ] **Step 3: Update docker-compose.yml**
Rename the service key from `customer-api-service` to `customer-service`.
Update the `context` to `./services/customer-service`.
Update `api-gateway`'s `depends_on` and `CUSTOMER_BACKEND_URL`.

- [ ] **Step 4: Update API Gateway (`services/api-gateway/index.ts`)**
Change `CUSTOMER_BACKEND_URL` to `http://customer-service:4002`.

- [ ] **Step 5: Commit**
`git add .`
`git commit -m "chore: rename customer-api-service to customer-service"`

---

### Task 2: Migrating Order Logic

**Files:**
- Create: `services/customer-service/src/routes/orders.ts`
- Modify: `services/customer-service/src/index.ts`
- Modify: `services/api-gateway/index.ts`

- [ ] **Step 1: Create Orders Route**
Implement `GET /api/storefront/orders` and `GET /api/storefront/orders/:id` in `services/customer-service/src/routes/orders.ts`. Use the JWT middleware for authentication.

- [ ] **Step 2: Register Orders Route**
In `src/index.ts`, add `app.use('/api/storefront/orders', orderRoutes);`.

- [ ] **Step 3: Update Gateway Routing**
Update `/api/storefront/orders` in `api-gateway/index.ts` to point to `CUSTOMER_BACKEND_URL` instead of `ADMIN_BACKEND_URL`.

- [ ] **Step 4: Commit**
`git add services/customer-service services/api-gateway`
`git commit -m "feat(customer-service): migrate storefront order endpoints"`

---

### Task 3: Migrating Shipping Logic

**Files:**
- Create: `services/customer-service/src/routes/shipping.ts`
- Modify: `services/customer-service/src/index.ts`
- Modify: `services/api-gateway/index.ts`

- [ ] **Step 1: Create Shipping Route**
Implement `GET /api/storefront/shipping/track/:orderId` in `services/customer-service/src/routes/shipping.ts`.

- [ ] **Step 2: Register Shipping Route**
In `src/index.ts`, add `app.use('/api/storefront/shipping', shippingRoutes);`.

- [ ] **Step 3: Update Gateway Routing**
Update `/api/storefront/shipping` in `api-gateway/index.ts` to point to `CUSTOMER_BACKEND_URL`.

- [ ] **Step 4: Commit**
`git add .`
`git commit -m "feat(customer-service): migrate storefront shipping endpoints"`

---

### Task 4: Final Validation & Cleanup

- [ ] **Step 1: Rebuild and Restart**
Run: `docker-compose up -d --build`

- [ ] **Step 2: Verify Endpoints**
Check `/health` of all services. Verify login, profile, orders, and tracking from the Storefront UI.

- [ ] **Step 3: Remove Redundant Routes from Admin Service**
(Optional cleanup) Remove storefront folders from `admin-service/src/routes/api/storefront` if they are no longer reachable via Gateway.

- [ ] **Step 4: Commit**
`git commit -m "chore: final cleanup and validation"`
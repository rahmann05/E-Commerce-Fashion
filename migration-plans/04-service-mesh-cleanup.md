# Phase 4: Service Mesh Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix inefficient queries and circular dependencies in internal service-to-service communication.
**Architecture:** Services communicate directly via docker hostnames, avoiding the public API Gateway for internal mesh traffic. N+1 queries are batched.
**Tech Stack:** Node.js, Express, Axios/Fetch

---

### Task 1: Fix Admin Cart Circular Dependency

**Files:**
- Modify: `services/admin-service/src/application/services/cart.service.ts`

- [ ] **Step 1: Point directly to commerce-service**
Change `INTERNAL_API_URL` from `http://api-gateway:8000/api/admin/storefront` to `http://commerce-service:3001/api/admin`. This prevents the request from routing out to the gateway and back.

### Task 2: Implement Batch Product Fetch

**Files:**
- Modify: `services/commerce-service/app/api/products/route.ts` 
- Modify: `services/customer-service/src/routes/cart.ts`

- [ ] **Step 1: Add batch endpoint capability**
In `commerce-service`, ensure `GET /api/products` accepts an array of `ids` (e.g., `?ids=1,2,3`) and returns the products in one query using `Prisma.product.findMany({ where: { id: { in: ids } } })`.

- [ ] **Step 2: Refactor Cart Hydration**
In `customer-service/src/routes/cart.ts`, collect all `productId`s from the cart items. Make a single fetch to `commerce-service` with `?ids=...`. Map the returned products to the cart items. Remove the `Promise.all` over individual fetches.
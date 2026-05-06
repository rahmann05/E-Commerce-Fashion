# Phase 3: Schema Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve duplicate database schemas between overlapping services.
**Architecture:** Merge admin-service and customer-service Prisma schemas into customer-service and share the client, or consolidate the database interactions.
**Tech Stack:** Prisma, PostgreSQL

---

### Task 1: Create Shared Database Package

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/prisma/schema.prisma`

- [ ] **Step 1: Extract schema to package**
Create `packages/database` and move the consolidated `schema.prisma` there (combining `admin-service` and `customer-service` models). Set up `package.json` to generate and export `@novure/database`.

### Task 2: Update services to use shared package

**Files:**
- Modify: `services/admin-service/package.json`
- Modify: `services/customer-service/package.json`

- [ ] **Step 1: Update dependencies**
Update `admin-service` and `customer-service` `package.json` to depend on `@novure/database`. 

- [ ] **Step 2: Clean up local Prisma schemas**
Remove their local Prisma folders (`services/admin-service/prisma` and `services/customer-service/prisma`). Replace imports of `@prisma/client` with `@novure/database`.

### Task 3: Clean up Commerce Service Env Vars

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Remove unused vars**
Remove `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `commerce-service` environment in `docker-compose.yml`.
# Environment Synchronization Implementation Plan (Local Only)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize local `.env` files in all services and apps with the root `.env` file to ensure consistency across the monorepo.

**Architecture:** The root `.env` serves as the Single Source of Truth (SSOT). Each local `.env` will be surgically updated to match the values of their counterparts in the root `.env`.

**Tech Stack:** Bash/PowerShell, Node.js (for verification if needed).

**Constraint:** DO NOT use git commands. Do not commit or push changes.

---

### Task 1: Update apps/admin-web/.env

**Files:**
- Modify: `apps/admin-web/.env`

- [ ] **Step 1: Update PUBLIC_GATEWAY_URL, PUBLIC_SUPABASE_URL, and PUBLIC_SUPABASE_ANON_KEY**

Update these variables to match the root `.env` values.

```env
PUBLIC_GATEWAY_URL="http://localhost:8000"
PUBLIC_SUPABASE_URL="https://ghdadhlyhzdkrjlurifj.supabase.co"
PUBLIC_SUPABASE_ANON_KEY="sb_publishable_cCpSv8zyGMeTbnYcFRKt6Q_qSmiV1Fq"
```

- [ ] **Step 2: Verify changes**

Run: `cat apps/admin-web/.env` (or `Get-Content` on Windows)
Expected: Values match the above.

### Task 2: Update apps/storefront-web/.env

**Files:**
- Modify: `apps/storefront-web/.env`

- [ ] **Step 1: Update NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, and NEXT_PUBLIC_SUPABASE_ANON_KEY**

```env
NEXT_PUBLIC_API_URL="http://localhost:8000/api/storefront"
NEXT_PUBLIC_SUPABASE_URL="https://ghdadhlyhzdkrjlurifj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_cCpSv8zyGMeTbnYcFRKt6Q_qSmiV1Fq"
```

- [ ] **Step 2: Verify changes**

Run: `cat apps/storefront-web/.env`
Expected: Values match the above.

### Task 3: Update services/admin-service/.env

**Files:**
- Modify: `services/admin-service/.env`

- [ ] **Step 1: Update DATABASE_URL, DIRECT_URL, PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, and MIDTRANS_SERVER_KEY**

```env
DATABASE_URL="postgresql://neondb_owner:npg_Xmay8OY6wKPL@ep-square-pine-ao2chbfh-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_Xmay8OY6wKPL@ep-square-pine-ao2chbfh-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
PUBLIC_SUPABASE_URL="https://ghdadhlyhzdkrjlurifj.supabase.co"
PUBLIC_SUPABASE_ANON_KEY="sb_publishable_cCpSv8zyGMeTbnYcFRKt6Q_qSmiV1Fq"
MIDTRANS_SERVER_KEY="Mid-server-mockedproductionkey123"
```

- [ ] **Step 2: Verify changes**

Run: `cat services/admin-service/.env`
Expected: Values match the above.

### Task 4: Update services/api-gateway/.env

**Files:**
- Modify: `services/api-gateway/.env`

- [ ] **Step 1: Update PORT, STOREFRONT_BACKEND_URL, ADMIN_BACKEND_URL, and PUBLIC_SUPABASE_URL**

```env
PORT=8000
STOREFRONT_BACKEND_URL="http://localhost:3001"
ADMIN_BACKEND_URL="http://localhost:4001"
PUBLIC_SUPABASE_URL="https://ghdadhlyhzdkrjlurifj.supabase.co"
```

- [ ] **Step 2: Verify changes**

Run: `cat services/api-gateway/.env`
Expected: Values match the above.

### Task 5: Update services/commerce-service/.env

**Files:**
- Modify: `services/commerce-service/.env`

- [ ] **Step 1: Update DATABASE_URL, DIRECT_URL, MIDTRANS_IS_PRODUCTION, MIDTRANS_SERVER_KEY, NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, NEXT_PUBLIC_SUPABASE_URL, and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY**

```env
DATABASE_URL="postgresql://postgres.ghdadhlyhzdkrjlurifj:Safdarrahman123_@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ghdadhlyhzdkrjlurifj:Safdarrahman123_@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
MIDTRANS_IS_PRODUCTION="false"
MIDTRANS_SERVER_KEY="Mid-server-mockedproductionkey123"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="Mid-client-R9h0sIekaFnOYxZE"
NEXT_PUBLIC_SUPABASE_URL="https://ghdadhlyhzdkrjlurifj.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_cCpSv8zyGMeTbnYcFRKt6Q_qSmiV1Fq"
```

- [ ] **Step 2: Verify changes**

Run: `cat services/commerce-service/.env`
Expected: Values match the above.

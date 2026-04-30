# URL Harmonization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded dummy URLs with environment variables and provide build instructions.

**Architecture:** Use production placeholders in `.env` and `docker-compose.yml` to support both local and production environments. Update Gateway CORS and Admin UI logic.

**Tech Stack:** Docker, Express (Gateway), SvelteKit (Admin), Next.js (Storefront).

---

### Task 1: Update Root Configuration

**Files:**
- Modify: `.env`
- Modify: `docker-compose.yml`

- [ ] **Step 1: Add production placeholders to `.env`**

Add the following to the end of the root `.env` file:
```bash
# PRODUCTION URLS (Placeholders)
STOREFRONT_PROD_URL="https://your-storefront.com"
ADMIN_PROD_URL="https://your-admin.com"
GATEWAY_PROD_URL="https://api.your-domain.com"
```

- [ ] **Step 2: Update `docker-compose.yml` to use production variables**

Update `api-gateway` environment:
```yaml
    environment:
      - PORT=8000
      - STOREFRONT_BACKEND_URL=http://commerce-service:3001
      - ADMIN_BACKEND_URL=http://admin-service:4001
      - STOREFRONT_URL=${STOREFRONT_PROD_URL:-http://localhost:3000}
      - ADMIN_URL=${ADMIN_PROD_URL:-http://localhost:4000}
```

Update `storefront-web` build args and environment:
```yaml
    build:
      context: ./apps/storefront-web
      args:
        - NEXT_PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}
        - NEXT_PUBLIC_API_URL=${GATEWAY_PROD_URL:-http://localhost:8000}/api/storefront
        - NEXT_PUBLIC_GATEWAY_URL=http://api-gateway:8000
    environment:
      - PORT=3000
      - NEXT_PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_GATEWAY_URL=http://api-gateway:8000
      - NEXT_PUBLIC_API_URL=${GATEWAY_PROD_URL:-http://localhost:8000}/api/storefront
      - INTERNAL_API_URL=http://api-gateway:8000/api/storefront
```

Update `admin-web` environment:
```yaml
    environment:
      - PORT=4000
      - PUBLIC_GATEWAY_URL=${GATEWAY_PROD_URL:-http://localhost:8000}
      - API_BASE_URL=http://api-gateway:8000/api/admin
```

- [ ] **Step 3: Commit configuration changes**

```bash
git add .env docker-compose.yml
git commit -m "config: add production URL placeholders and update docker-compose"
```

---

### Task 2: Update API Gateway CORS

**Files:**
- Modify: `services/api-gateway/index.ts`

- [ ] **Step 1: Update `allowedOrigins` logic**

Replace the hardcoded `allowedOrigins` with a dynamic version that includes production placeholders.

```typescript
const allowedOrigins = [
  process.env.STOREFRONT_PROD_URL,
  process.env.ADMIN_PROD_URL,
  process.env.STOREFRONT_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:4000',
  'http://storefront-web:3000',
  'http://admin-dashboard:4000'
].filter(Boolean) as string[];
```

- [ ] **Step 2: Verify Gateway builds**

Run: `cd services/api-gateway && npm run build`
Expected: Successful build (tsc)

- [ ] **Step 3: Commit Gateway changes**

```bash
git add services/api-gateway/index.ts
git commit -m "feat(gateway): dynamic CORS allowed origins for production"
```

---

### Task 3: Fix Admin Dashboard Hardcoded URLs

**Files:**
- Modify: `apps/admin-web/src/lib/config.ts`
- Modify: `apps/admin-web/src/routes/products/new/+page.svelte`

- [ ] **Step 1: Add Storefront URL to config**

Modify `apps/admin-web/src/lib/config.ts`:
```typescript
import { env } from '$env/dynamic/public';

// URL Storefront untuk preview gambar atau link produk
export const STOREFRONT_URL = env.PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

const GATEWAY_URL = env.PUBLIC_GATEWAY_URL || 'http://localhost:8000';
// ... rest unchanged
```

- [ ] **Step 2: Use dynamic URL in Product Page**

In `apps/admin-web/src/routes/products/new/+page.svelte`, import `STOREFRONT_URL` and replace the hardcoded string.

```typescript
import { STOREFRONT_URL } from '$lib/config';
// ...
<img src={imageUrl.startsWith('http') ? imageUrl : `${STOREFRONT_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`} ... />
```

- [ ] **Step 3: Commit Admin fixes**

```bash
git add apps/admin-web/src/lib/config.ts apps/admin-web/src/routes/products/new/+page.svelte
git commit -m "fix(admin): replace hardcoded storefront URL in image preview"
```

---

### Task 4: Final Verification & Build Instructions

- [ ] **Step 1: Test full Docker build**

Run: `docker-compose build`
Expected: All images build successfully.

- [ ] **Step 2: Create Build Guide**

Create `docs/BUILD_GUIDE.md` with the following content:

```markdown
# Build & Deployment Guide

## Docker Build (Recommended)
Jalankan perintah ini di root folder:
```bash
docker-compose build
```

## Manual Build (Per Service)
Jika ingin build secara manual di environment masing-masing:

### 1. API Gateway
```bash
cd services/api-gateway && npm install && npm run build
```

### 2. Core Commerce Service
```bash
cd services/commerce-service && npm install && npm run build
```

### 3. Admin Management Service
```bash
cd services/admin-service && npm install && npm run build
```

### 4. Storefront Web
```bash
cd apps/storefront-web && npm install && npm run build
```

### 5. Admin Dashboard
```bash
cd apps/admin-web && npm install && npm run build
```
```

- [ ] **Step 3: Commit Build Guide**

```bash
git add docs/BUILD_GUIDE.md
git commit -m "docs: add comprehensive build guide"
```

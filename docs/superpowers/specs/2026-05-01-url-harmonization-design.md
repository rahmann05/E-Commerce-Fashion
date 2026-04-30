# URL Harmonization & Build Strategy Design

**Date:** 2026-05-01
**Topic:** Replace dummy URLs with production placeholders and provide build instructions.

## 1. Problem Statement
The current codebase uses `localhost` hardcoded in several places (docker-compose, config files, and UI components). This makes deployment difficult as these values need to be manually changed for production. The user wants to use placeholders that can accommodate both local development and future production domains.

## 2. Proposed Design

### 2.1 Configuration (Environment Variables)
We will introduce three new variables in the root `.env` to act as production placeholders:
- `STOREFRONT_PROD_URL`: Placeholder for the public storefront domain.
- `ADMIN_PROD_URL`: Placeholder for the public admin dashboard domain.
- `GATEWAY_PROD_URL`: Placeholder for the public API gateway domain.

### 2.2 Orchestration (`docker-compose.yml`)
Modify `docker-compose.yml` to favor these production variables if they are set, otherwise fall back to the existing `localhost` defaults. This ensures the Docker build environment is flexible.

### 2.3 API Gateway (`services/api-gateway/index.ts`)
The `allowedOrigins` list will be updated to dynamically include both the production URLs and the local development URLs. This allows the same gateway to serve both environments without code changes.

### 2.4 Admin Dashboard Fixes
- **Product Image Preview:** In `apps/admin-web/src/routes/products/new/+page.svelte`, the hardcoded `http://localhost:3000` will be replaced with a dynamic variable that pulls from the environment or a configuration file.
- **Config file:** Ensure `apps/admin-web/src/lib/config.ts` handles the production gateway URL.

### 2.5 Build Strategy
Provide a dual-mode build approach:
1. **Docker Build:** Using `docker-compose build` for containerized deployment.
2. **Local Build:** A set of commands to build each service individually for CI/CD or non-Docker environments.

## 3. Implementation Details

### 3.1 .env updates
```bash
STOREFRONT_PROD_URL="https://your-storefront.com"
ADMIN_PROD_URL="https://your-admin.com"
GATEWAY_PROD_URL="https://api.your-domain.com"
```

### 3.2 Gateway Origins logic
```typescript
const allowedOrigins = [
  process.env.STOREFRONT_PROD_URL,
  process.env.ADMIN_PROD_URL,
  process.env.STOREFRONT_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:4000',
  'http://storefront-web:3000',
  'http://admin-dashboard:4000'
].filter(Boolean);
```

## 4. Verification Plan
- Verify that `docker-compose.yml` variables are correctly mapped.
- Verify that API Gateway correctly handles CORS for both local and (placeholder) production origins.
- Verify that Admin Dashboard image previews use the correct storefront URL.
- Test build commands for each service.

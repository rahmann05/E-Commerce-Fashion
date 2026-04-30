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

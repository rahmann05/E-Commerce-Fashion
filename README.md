# Novure Headless Microservices Ecosystem

Arsitektur headless e-commerce yang modular, terukur, dan terisolasi.

## Layanan & Arsitektur (Unified Headless)
Sistem menggunakan arsitektur dual-database untuk mengoptimalkan performa dan isolasi data:

1.  **api-gateway (Port 8000)**: Single entry point. Mengelola CORS dynamic, routing cerdas, dan proxying antar layanan.
2.  **commerce-service (Port 3001)**: Catalog Engine (Supabase). Menangani Produk, Kategori, dan Review.
3.  **admin-service (Port 4001)**: Transaction & Identity Engine (Neon). Menangani Customer, Order, Cart, dan Management Internal (Staff/Audit).
4.  **storefront-web (Port 3000)**: Consumer Frontend (Next.js). Mengonsumsi data katalog dan transaksi via Gateway.
5.  **admin-web (Port 4000)**: Management Dashboard (SvelteKit). Studio kontrol untuk katalog (Supabase) dan transaksi (Neon).

## Konfigurasi Database
- **Supabase (PostgreSQL)**: Katalog produk (High Read, Low Write).
- **Neon (PostgreSQL)**: Transaksi & Identitas (High Write, Consistent Read).

## Cara Menjalankan (Development)
Jalankan setiap layanan di terminal terpisah:

```bash
# 1. API Gateway
cd services/api-gateway && npm run dev

# 2. Commerce Service
cd services/commerce-service && npm run dev

# 3. Admin Service
cd services/admin-service && npm run dev

# 4. Storefront
cd apps/storefront-web && npm run dev

# 5. Admin Dashboard
cd apps/admin-web && npm run dev
```

## Persiapan Produksi / Hosting
1.  Pastikan `DATABASE_URL` di masing-masing backend menunjuk ke instance Neon dan Supabase yang benar.
2.  Update `allowedOrigins` di `api-gateway/index.ts` dengan domain asli storefront dan admin Anda.
3.  Jalankan `npx prisma db push` di kedua folder API untuk memastikan skema database sinkron.
4.  Gunakan `pm2` atau `Docker` untuk mengelola kelima proses ini di server.

## Deployment (Kubernetes)
Gunakan manifes di folder `k8s/` untuk deployment skala besar:

```bash
# 1. Create Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Setup Secrets (Contoh)
kubectl create secret generic novure-secrets \
  --from-literal=core-database-url="YOUR_NEON_URL" \
  --namespace=novure-ecosystem

# 3. Apply Deployments
kubectl apply -f k8s/
```

---
**Status: Ready for Hosting (Enterprise Grade)**
- [x] Database Isolation (Neon & Supabase)
- [x] API Standardization ({ success, data, message })
- [x] Gateway Proxying & CORS Config
- [x] Frontend Syncing & Hook Fixes
- [x] Docker & Kubernetes Ready

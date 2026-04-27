# Novure Headless Microservices Ecosystem

Arsitektur headless e-commerce yang modular, terukur, dan terisolasi.

## Layanan & Arsitektur
Sistem terdiri dari 5 layanan utama yang berkomunikasi melalui API Gateway:

1.  **api-gateway (Port 8000)**: Single entry point. Mengelola CORS, routing, dan integrasi antar layanan.
2.  **core-commerce-api (Port 3001)**: Headless Commerce Engine. Menangani katalog produk, keranjang, pesanan, dan autentikasi pelanggan. Menggunakan database **Neon (PostgreSQL)**.
3.  **admin-management-api (Port 4001)**: Management Engine. Menangani data staf, audit log, dan konfigurasi sistem. Menggunakan database **Supabase (PostgreSQL)**.
4.  **storefront-web (Port 3000)**: Consumer Frontend (Next.js). Antarmuka pelanggan yang mengonsumsi Core API via Gateway.
5.  **admin-dashboard (Port 4000)**: Management Frontend (SvelteKit). Antarmuka admin yang mengonsumsi Admin & Core API via Gateway.

## Konfigurasi Database
- **Neon**: Digunakan oleh `core-commerce-api` untuk isolasi data transaksional pelanggan yang ber-traffic tinggi.
- **Supabase**: Digunakan oleh `admin-management-api` untuk data operasional internal dan fitur real-time admin.

## Cara Menjalankan (Development)
Jalankan setiap layanan di terminal terpisah:

```bash
# 1. API Gateway
cd api-gateway && npm run dev

# 2. Core API
cd core-commerce-api && npm run dev

# 3. Admin API
cd admin-management-api && npm run dev

# 4. Storefront
cd storefront-web && npm run dev

# 5. Admin Dashboard
cd admin-dashboard && npm run dev
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

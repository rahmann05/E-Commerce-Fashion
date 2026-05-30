# Commerce Service Agent Guidelines (Express Layered)

*(Updated 2026-05-07 to reflect standardized routing and Layered Architecture. Existing non-contradictory guidelines must be preserved.)*

## 1. Instruksi dan Panduan Teknis Mendalam

Dokumen ini adalah spesifikasi arsitektur tingkat rendah untuk `commerce-service`. Layanan ini bertanggung jawab atas domain produk, kategori, ulasan, dan kalkulasi logistik.

### Arsitektur Inti: Layered Architecture (Murni API)
Layanan ini menggunakan pola desain berlapis untuk pemisahan tanggung jawab yang jelas:
- **Routes (`src/routes/`)**: Hanya bertanggung jawab untuk definisi endpoint Express dan pemetaan middleware (seperti validasi Joi). Dilarang memasukkan logika bisnis di sini.
- **Controllers (`src/controllers/`)**: Bertindak sebagai orkestrator tipis. Mengambil data dari `req` (params, query, body), memanggil layer Service, dan mengembalikan respon dalam amplop `ApiResponse` standar.
- **Services (`src/services/`)**: **Pusat Logika Bisnis**. Seluruh perhitungan, manipulasi data, dan aturan validasi tingkat tinggi wajib diletakkan di sini agar dapat diuji secara mandiri (*Unit Testable*).
- **Database Client (`src/db/client.ts`)**: Satu-satunya titik akses untuk instance Prisma, yang sekarang menggunakan `@prisma/adapter-pg` dengan `pg.Pool`.

### Standar Pengembangan API
- **Zero UI Logic**: Dilarang keras memasukkan logika rendering atau elemen frontend. Balasan harus selalu berupa JSON murni.
- **OpenAPI Compliance**: Gunakan amplop respon standar: `{ success: true, data: ... }` atau `{ success: false, error: "pesan" }`.
- **Error Handling**: Semua kegagalan harus ditangkap oleh blok `try-catch` di level Controller dan diteruskan ke middleware `errorHandler` via `next(err)`.

### Keamanan Internal (Mesh)
- Layanan ini dipanggil secara eksklusif oleh API Gateway.
- Verifikasi header `x-internal-key` (sesuai `INTERNAL_SERVICE_KEY`) wajib dilakukan untuk pemanggilan antar-layanan (seperti dari `customer-service` untuk validasi stok produk).

---

## 2. Kondisi Saat Ini (Source of Truth)

### Struktur Direktori (`src/`)
- **`controllers/`**: 
  - `product.controller.ts`: Orchestrator produk & pencarian.
  - `category.controller.ts`: Manajemen grup katalog.
  - `review.controller.ts`: Pengelolaan ulasan pengguna.
  - `shipping.controller.ts`: Kalkulasi biaya logistik (Haversine Formula).
  - `analytics.controller.ts`: Agregasi data penjualan produk.
  - `health.controller.ts`: Pengecekan konektivitas basis data.
- **`services/`**: Implementasi logika bisnis untuk seluruh domain di atas (misal: `ProductService.ts`).
- **`routes/`**: Pemetaan endpoint Express (misal: `product.routes.ts`).
- **`db/`**: Koneksi Prisma terpusat.
- **`middleware/`**: 
  - `error-handler.ts`: Penangkap error global dengan format JSON.
- **`utils/`**: Helper keamanan seperti `password.ts` (hashing).
- **`dtos/`**: Kontrak bentuk data produk (`product.dto.ts`).

### Integrasi
- **Framework**: Express 5.
- **Database**: PostgreSQL via `@novarium/database`.
- **Runtime & Execution**: Node.js 20+. Dockerfile menggunakan `npx tsx src/index.ts` untuk menjalankan layanan.
- **Port**: **3001** (Internal Mesh).
- **BFF Alignment**: Di-mount oleh API Gateway pada jalur internal `/api/commerce`.

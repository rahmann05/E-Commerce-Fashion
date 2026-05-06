# Customer Service Agent Guidelines (Express Layered)

## 1. Instruksi dan Panduan Teknis Mendalam

Dokumen ini adalah spesifikasi arsitektur untuk `customer-service`. Layanan ini bertanggung jawab atas domain pelanggan, akun, keranjang, checkout, dan riwayat pesanan.

### Arsitektur: Layered Architecture
Layanan ini menggunakan pola desain berlapis untuk pemisahan tanggung jawab yang jelas:
- **Routes**: Terletak di `src/routes/`. Mendefinisikan endpoint Express dan memanggil controller.
- **Controllers**: Terletak di `src/controllers/`. Menangani orkestrasi request/response dan memanggil layer Service atau DB.
- **DB Client**: Terletak di `src/db/client.ts`. Akses Prisma terpusat.

### Keamanan & Integrasi
- **JWT**: Validasi JWT dilakukan di Gateway, namun layanan ini juga memiliki middleware `authenticateJWT` sebagai pertahanan berlapis.
- **Internal Service Mesh**: Menggunakan `x-internal-key` untuk memvalidasi permintaan antar layanan internal melalui Gateway.
- **Midtrans**: Menangani integrasi Core API Midtrans untuk inisiasi transaksi dan webhook notifikasi.

---

## 2. Kondisi Saat Ini (Source of Truth)

### Struktur Direktori (`src/`)
- `controllers/`: `auth.controller.ts`, `account.controller.ts`, `cart.controller.ts`, `checkout.controller.ts`, `orders.controller.ts`, `shipping.controller.ts`.
- `routes/`: `account.ts`, `auth.ts`, `cart.ts`, `checkout.ts`, `orders.ts`, `shipping.ts`.
- `db/`: `client.ts` (Prisma connection).
- `middleware/`: `auth.ts` (JWT handling).
- `utils/`, `dtos/`, `types/`: Folder pendukung arsitektur berlapis.

### Integrasi
- **Database**: PostgreSQL (via `@novure/database`).
- **Networking**: Berjalan pada port **4002** di dalam Docker. Dipanggil oleh API Gateway pada rute `/api/storefront/*`.

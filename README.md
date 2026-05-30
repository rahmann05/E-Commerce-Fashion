# Novarium E-Commerce 

Novarium E-Commerce adalah sebuah platform *e-commerce* berskala *enterprise* dengan arsitektur **True Microservices**. Sistem ini didesain agar sangat modular, *scalable*, dan mudah dikelola melalui pemisahan domain yang ketat antar berbagai fungsionalitas bisnis utama.

## Arsitektur Sistem 🏗️

Proyek ini menggunakan pola arsitektur **Microservices** murni. Komunikasi yang sebelumnya dikelola oleh sebuah `api-gateway` raksasa telah sepenuhnya diubah ke dalam bentuk komunikasi *direct service-to-service* melalui *internal networking* yang aman. Semua layanan (*services*) sepenuhnya *stateless* dan berdikari.

### 1. Pembagian Bounded Context (Database)
Untuk menghindari *bottleneck* tunggal, kita menerapkan isolasi data dengan membagi dua *core database*:
- **Storefront DB (Supabase/PostgreSQL):** Menyimpan seluruh data terkait katalog produk, *review*, dan akun pelanggan. Diakses oleh `commerce-service` dan `customer-service`.
- **Operational DB (Neon/PostgreSQL):** Menyimpan seluruh data pesanan, manajemen operasional, dan admin (termasuk *tracking* ongkir). Diakses oleh `admin-service` dan `order-service`.

### 2. Peta Domain & Microservices
Setiap bagian dari platform dipecah menjadi layanan terpisah sebagai berikut:

- **Frontend Applications** (`/apps`):
  - **`storefront-web` (Next.js):** Aplikasi *frontend* (Headless E-Commerce) untuk pembeli. Menampilkan katalog, keranjang belanja, *checkout*, dsb.
  - **`admin-web` (SvelteKit):** Dashboard administrasi untuk manajemen stok, pengelolaan produk, dan konfirmasi pesanan.

- **Backend Services** (`/services`):
  - **`commerce-service` (Port: 3001):** Mengelola domain Produk, Kategori, *Inventory*, dan ulasan produk (Storefront DB).
  - **`admin-service` (Port: 4001):** Layanan murni untuk otentikasi Admin, dan mengelola analitik operasional (Operational DB).
  - **`customer-service` (Port: 4002):** Layanan khusus untuk otentikasi Pelanggan (Customer), manajemen Profil, dan Keranjang (Storefront DB).
  - **`order-service` (Port: 4003):** Layanan spesifik menangani pemesanan (*Order*), *Checkout*, integrasi Midtrans, dan ongkos kirim (Operational DB).

- **Shared Packages** (`/packages`):
  - **`@novarium/shared`**: Pustaka khusus internal yang digunakan di seluruh *microservices*. Berisi *Middleware* keamanan (Auth, CORS, Error Handler), utilitas enkripsi (*password hashing*), dan klien HTTP (*Service Client*) untuk komunikasi antar-*service* via internal-key.

### 3. Keamanan & Otentikasi 🛡️
Semua layanan memiliki standar pengamanan internal melalui paket `@novarium/shared`. Terdapat dua lapisan pengamanan:
1.  **Public/Client Access (JWT):** Menggunakan *cookie-based JWT* bernama `novarium_jwt`. Setiap permintaan publik dari *browser* disaring oleh `AuthMiddleware`.
2.  **Internal Mesh Access:** Komunikasi antar *service* di Docker (seperti saat `order-service` mengambil info detail stok ke `commerce-service`) dibebaskan dari kewajiban membawa JWT milik pelanggan, melainkan menggunakan rahasia internal `x-internal-key` yang hanya diketahui oleh kontainer secara *backend*.

## Cara Menjalankan (Development)

Sistem ini didesain menggunakan **Docker Compose** dan **NPM Workspaces**.

### Persyaratan:
- Node.js versi 20+
- Docker & Docker Compose
- Dua buah Database PostgreSQL (Storefront DB & Operational DB)

### Langkah-langkah:
1.  Install seluruh dependensi dari folder *root*:
    ```bash
    npm install
    ```
2.  Salin dan isi `.env` sesuai dengan konfigurasi masing-masing koneksi database dan *secret key*.
3.  Jalankan *build* dan integrasi kontainer secara serentak menggunakan:
    ```bash
    docker-compose up --build -d
    ```

Sistem akan otomatis me-*routing* port internal dan memunculkan *storefront* di `http://localhost:3000` serta *admin panel* di `http://localhost:5173`.

# Commerce Service 📦

Commerce Service adalah otak *e-commerce* Novarium yang menangani seluruh domain data "Katalog". Layanan ini murni menyediakan antarmuka API (Express.js) dan terhubung langsung ke **Storefront Database** (Supabase/PostgreSQL).

## Tanggung Jawab Domain
Layanan ini mengelola semua entitas yang berkaitan dengan wujud sebuah toko, yaitu:
- Katalog Produk & Varian (Warna, Ukuran).
- Kategori Produk (Tees, Jeans, dsb).
- Inventaris & Stok Barang.
- Sistem Ulasan (Review) dan Penilaian (Rating) Produk.
- Manajemen Media (Upload foto produk via integrasi eksternal, dsb).

## Arsitektur Internal
- **Port Layanan:** Terjalan di port `3001` (secara default).
- **Database:** Prisma ORM, dengan referensi *schema* yang bersih dan terisolasi khusus untuk kebutuhan Katalog saja (entitas `Product`, `Category`, `Review`).
- **Rute Utama:** 
  - `/api/commerce/products`
  - `/api/commerce/categories`
  - `/api/commerce/reviews`
  - Rute tambahan spesifik Admin (`/api/commerce/admin/*`) yang diamankan ketat.

## Standar Keamanan
Commerce Service menggunakan _middleware_ tersentralisasi dari paket `@novarium/shared`.
- Otentikasi publik diperiksa menggunakan `novarium_jwt`.
- Terdapat jalur khusus (komunikasi internal kontainer) untuk diakses oleh `order-service` saat hendak memvalidasi sisa stok ketika seorang pelanggan sedang _checkout_. Jalur komunikasi *backend-to-backend* ini memanfaatkan header *x-internal-key*.

## Perintah Pengembangan
```bash
# Generate tipe database prisma khusus commerce
npx prisma generate

# Menjalankan development mode
npm run dev
```

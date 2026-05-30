# Novarium Admin Dashboard (SvelteKit) 📊

Aplikasi panel manajemen (dashboard) bagi pengelola (Admin) e-commerce Novarium.

## Arsitektur & Teknologi

*   **Framework:** SvelteKit (Svelte 4/5).
*   **Rendering:** SSR-First dengan optimisasi transisi klien.
*   **Styling:** Modern, responsif, berfokus pada kecepatan baca data (Tabel operasional, Manajemen Stok).
*   **Otentikasi:** Berbasis Cookie yang disinkronisasi melalui Svelte `hooks.server.ts` sebelum render dilakukan.

Seiring dengan arsitektur Microservices, Admin Dashboard secara asinkron berkomunikasi ke tiga API utama:
1.  **Admin Service:** Proses otentikasi login admin dan mendapatkan data ringkasan analitik internal.
2.  **Commerce Service:** Untuk Create/Update/Delete (CRUD) produk baru, manajemen inventaris stok (Storefront DB).
3.  **Order Service:** Melacak, membaca detail, dan mengubah status pesanan milik pelanggan (Operational DB).

## Konfigurasi Penting (`src/lib/api/config.ts`)
Berhubung SvelteKit memiliki dua *runtime* (Server dan Klien/Browser), URL API secara otomatis disesuaikan menggunakan `$env/dynamic/public`. 
Aplikasi membaca `$env.PUBLIC_COMMERCE_API_URL`, `$env.PUBLIC_ADMIN_API_URL`, dan `$env.PUBLIC_ORDER_API_URL`.

## Perintah Pengembangan
```bash
# Menjalankan development server (port 5173)
npm run dev

# Melakukan build produksi
npm run build
```

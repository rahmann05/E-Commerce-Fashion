# Novarium Storefront Web (Next.js) 🛒

Aplikasi *frontend* utama bagi pembeli dan pengunjung e-commerce Novarium.

## Arsitektur & Teknologi

*   **Framework:** Next.js 14+ (App Router).
*   **Rendering:** Hybrid (Static Site Generation untuk Katalog & Server-Side Rendering untuk Keranjang/Checkout).
*   **Styling:** Vanilla CSS dengan desain modern, UI dinamis, dan efek *glassmorphism*.
*   **Komunikasi API:** Menggunakan metode *headless*.

Aplikasi ini tidak lagi terhubung ke *API Gateway*, melainkan secara dinamis (menggunakan `process.env.PUBLIC_..._API_URL`) memanggil secara *direct* ke tiga layanan microservices di backend:
1.  **Commerce Service:** Mengambil katalog produk, gambar, dan kategori.
2.  **Customer Service:** Otentikasi pelanggan, sinkronisasi profil, dan isi keranjang belanja.
3.  **Order Service:** Melakukan kalkulasi pengiriman (ongkir) dan inisiasi transaksi Checkout.

## Struktur Folder Utama
- `src/app`: Komponen utama App Router (rute web).
- `src/components`: UI dasar yang modular.
- `src/features`: Fitur *bounded-context* frontend (seperti `auth`, `cart`, `catalogue`, `checkout`).
- `src/lib/api`: Kumpulan fungsi untuk interaksi langsung ke backend *microservices*. Telah dikonfigurasikan agar port URL-nya beradaptasi secara pintar ke *localhost* (saat *development*) dan *docker host* (saat di dalam kontainer).

## Perintah Pengembangan
```bash
# Menjalankan development server (port 3000)
npm run dev

# Melakukan build produksi
npm run build
```

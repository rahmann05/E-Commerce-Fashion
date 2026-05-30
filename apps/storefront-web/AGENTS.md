# Storefront Web Agent Guidelines (Next.js 15)

*(Updated 2026-05-07 to reflect standardized routing and Layered Architecture. Existing non-contradictory guidelines must be preserved.)*

## 1. Instruksi dan Panduan Teknis Mendalam

Dokumen ini adalah spesifikasi arsitektur tingkat rendah untuk semua agen AI dan pengembang yang memodifikasi `storefront-web`. 

### Arsitektur Inti: Murni Headless (Presentation Layer)
- **Larangan Akses Database Langsung**: `storefront-web` adalah lapisan presentasi. Dilarang menginstal atau menggunakan `@prisma/client` atau SDK database apapun. Semua interaksi data wajib melalui API Gateway (`:8000`).
- **Pola BFF (Backend for Frontend)**: Frontend mengonsumsi endpoint yang telah dioptimalkan oleh Gateway (`/api/storefront/*`, yang secara internal di-rewrite oleh Gateway ke prefix terstandarisasi). Jangan pernah mencoba memanggil layanan backend (seperti port 3001 atau 4002) secara langsung.
- **Kontrak Backend**: Layanan backend menggunakan arsitektur berlapis (controllers/services/db). Frontend tidak bergantung pada struktur internal backend, hanya kontrak API.

### Next.js 15 & React 19: Standar Modern
- **Server-First Fetching**: Prioritaskan penggunaan Server Components untuk pengambilan data awal. 
  - **Caching**: Next.js 15 menggunakan `no-store` secara default. Gunakan `cache: 'force-cache'` hanya untuk konten statis (mis. Footer, Header).
- **Server Actions**: Letakkan di `src/lib/actions/`. Gunakan pola delegasi: Server Action memanggil `lib/api/` -> `lib/api` memanggil Gateway.
- **Micro-interactions (UI/UX)**:
  - Gunakan `framer-motion` untuk semua animasi. 
  - **Kurva Animasi**: Wajib menggunakan kurva `[0.16, 1, 0.3, 1]` untuk kesan premium.
  - **Image Optimization**: Gunakan komponen `<Image />` Next.js dengan properti `priority` untuk elemen LCP (Largest Contentful Paint) seperti Hero Image.

### Keamanan & State
- **Cookie-Based Auth**: Jangan gunakan `localStorage`. Pastikan semua pemanggilan API menggunakan `credentials: "include"` untuk menyertakan `novarium_jwt` otomatis.
- **Form Validation**: Lakukan validasi sisi klien (Client-side) sebelum mengirim data ke Gateway untuk meningkatkan UX, namun tetap percayakan validasi final pada Joi di level Gateway.

---

## 2. Kondisi Saat Ini (Source of Truth)

### Pemetaan Direktori (`src/`)
- **`app/`**: Struktur rute berbasis file. Rute utama: `/catalogue`, `/login`, `/profile`.
- **`features/`**: Unit fungsional mandiri.
  - `catalogue/`: Menampilkan grid produk dan modal detail. (Ejaan: **`catalogue`**).
  - `auth/`: Menangani alur login, register, dan manajemen profil.
  - `checkout/`: Integrasi Map (Leaflet) dan alur pembayaran.
- **`components/`**: Komponen atomik.
  - `animations/`: Wadah untuk komponen visual berat (Wave, 3D Slider, Marquee).
  - `atoms/`: Tombol, input, kartu produk dasar.
- **`lib/api/`**: **Satu-satunya sumber data**. Berisi:
  - `auth.ts`, `cart.ts`, `catalogue.ts`, `account.ts`, `orders.ts`, `shipping.ts`.
- **`styles/`**: Seluruh file CSS. Menggunakan konvensi penamaan deskriptif (mis. `CatalogueWaveSection.module.css`).

### State Arsitektur Saat Ini
- **API Version**: Mengonsumsi API Gateway v2.2.0.
- **Import Aliases**: Selalu gunakan `@/` untuk merujuk ke folder `src`.
- **Typing**: Seluruh tipe data `any` telah dihapus dan diganti dengan antarmuka TypeScript yang ketat atau `Record<string, unknown>`.

# Admin Web Agent Guidelines (SvelteKit 2)

*(Updated 2026-05-07 to reflect standardized routing and Layered Architecture. Existing non-contradictory guidelines must be preserved.)*

## 1. Instruksi dan Panduan Teknis Mendalam

Dokumen ini merupakan mandat arsitektural untuk pengembangan `admin-web`. Aplikasi ini adalah dasbor operasional yang mengutamakan kepadatan data dan akurasi informasi.

### Arsitektur Inti: Headless SvelteKit
- **Decoupled Backend**: Frontend ini tidak memiliki koneksi database. Seluruh data diambil dari API Gateway (:8000).
- **Server Loaders**: Manfaatkan `+page.server.ts` untuk mengambil data sensitif atau data besar sebelum halaman dirender. Gunakan parameter `fetch` bawaan SvelteKit untuk menjaga integritas sesi (cookie).
- **Kontrak Backend**: Backend memakai arsitektur berlapis (controllers/services/db). Admin UI hanya mengikuti kontrak API Gateway.

### Svelte 5 & Reaktivitas
- **Wajib Menggunakan Runes**: Gantikan pola `writable stores` dengan `$state` dan `$derived` jika memungkinkan untuk *local state*.
- **Prop Declaration**: Gunakan `$props()` secara eksplisit. Pastikan untuk melakukan *destructuring* dengan benar agar reaktivitas tidak terputus.

### Panduan UI/UX (Admin Standard)
- **Data Density**: Gunakan tabel (`OrderTable`) dan grid metrik (`DashboardMetrics`) untuk menyajikan informasi operasional secara padat.
- **A11y & Semantics**: Svelte compiler akan memberikan peringatan keras untuk pelanggaran aksesibilitas. Pastikan setiap elemen interaktif memiliki label dan *keyboard handler*.
- **Editorial Dashboards**: Meskipun ini aplikasi admin, tetap gunakan elemen desain premium (whitespace luas di header, font Inter tebal) agar selaras dengan brand Novarium.

---

## 2. Kondisi Saat Ini (Source of Truth)

### Struktur Rute (`src/routes/`)
- **Route Groups**:
  - `(auth)/`: Rute identitas bersih tanpa sidebar (`/login`, `/logout`).
  - `(dashboard)/`: Seluruh rute operasional (`/analytics`, `/categories`, `/orders`, `/products`).
- **Layouting**: `(dashboard)/+layout.svelte` mengelola navigasi global dan informasi lingkungan (ENV).

### Struktur Modular (`src/`)
- **`features/`**:
  - `analytics/`: Komponen grafik (`SalesVelocityChart`) dan ringkasan eksekutif.
  - `products/`: Manajemen inventaris (Ejaan: **`products`**).
  - `order/`: Manajemen transaksi dan status pengiriman.
- **`components/`**: Mengikuti *Atomic Design*.
  - `atoms/`: `StatusPill.svelte`, `UploadImage.svelte`.
  - `molecules/`: `InsightCard.svelte`.
- **`lib/api/`**: Klien API modular.
  - `products.ts`, `orders.ts`, `analytics.ts`.
  - `dashboard.ts`: Orkestrator yang menggabungkan beberapa panggilan API untuk halaman Overview.

### Keamanan & Teknis
- **Path Aliases**: Tersedia `@components`, `@features`, `@styles`, `@lib`, dan `@/`.
- **CSS Hierarchy**: Seluruh gaya berada di `src/styles/`. `admin.css` berisi utilitas tata letak dasbor.
- **Auth**: Menggunakan JWT yang dikirimkan otomatis via cookie oleh API Gateway.

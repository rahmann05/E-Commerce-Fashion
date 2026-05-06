# API Gateway Agent Guidelines (Express BFF)

## 1. Instruksi dan Panduan Teknis Mendalam

Dokumen ini adalah mandat operasi untuk `api-gateway`. Gateway ini bertindak sebagai **Backend for Frontend (BFF)**, penjaga keamanan, dan pengatur lalu lintas tunggal untuk seluruh ekosistem.

### Arsitektur BFF (Backend for Frontend)
- **Isolasi Rute**: Pisahkan jalur `/api/storefront/*` (untuk pembeli) dan `/api/admin/*` (untuk pengelola) secara modular.
- **Proxying (http-proxy-middleware v3)**: 
  - Gunakan pabrik `proxyOptions` di `src/proxies/common.proxy.ts`. 
  - Wajib memanggil `fixRequestBody(proxyReq, req)` karena penggunaan middleware `express.json()`.
- **Path Rewriting**: Tangani translasi URL publik yang ramah (mis. `/api/admin/auth`) ke rute internal yang teknis (mis. `/api/admin/management/auth`) di level proksi.
- **Kontrak Layanan**: Downstream service mengikuti arsitektur berlapis (controllers/services/db). Gateway tidak bergantung pada struktur internalnya.

### Protokol Keamanan & Validasi
- **CORS Hardening**: Hanya izinkan origin yang terdaftar di `env.ALLOWED_ORIGINS`. Localhost diizinkan hanya pada mode development.
- **Autentikasi JWT**: Verifikasi token secara terpusat. Teruskan identitas ke layanan hilir via header `x-user-id` dan `x-user-role`.
- **Internal Service Mesh**: Validasi header `x-internal-key` terhadap `INTERNAL_SERVICE_KEY`. Ini memungkinkan layanan internal (seperti `customer-service`) berkomunikasi via gateway secara aman.
- **Validasi Joi**: Semua rute mutasi (POST/PUT/PATCH) wajib memiliki middleware `validate(schema)` menggunakan skema dari `@novure/contracts`.

---

## 2. Kondisi Saat Ini (Source of Truth)

### Konfigurasi & Core (`src/`)
- **`config/env.ts`**: Validasi ketat terhadap seluruh variabel lingkungan yang dibutuhkan.
- **`app.ts`**: Instansiasi Express dengan CORS terproteksi dan parser JSON.
- **`routes/index.ts`**: Hub pusat yang mendaftarkan seluruh sub-router BFF.

### Hierarki Rute Modular
- **`routes/storefront/`**: 
  - `auth.routes.ts`: Validasi login/register.
  - `cart.routes.ts`: Proxy keranjang belanja.
  - `catalog.routes.ts`: Proxy produk & kategori (Akses Publik).
  - `checkout.routes.ts`: Validasi inisiasi pembayaran & webhook.
  - `account.routes.ts`: Manajemen profil user.
- **`routes/admin/`**:
  - `users.routes.ts`: Otentikasi admin.
  - `products.routes.ts`: Manajemen inventaris (dengan validasi Joi ketat).
  - `orders.routes.ts`: Manajemen pesanan & analitik.
  - `management.routes.ts`: Pengaturan sistem & logistik.

### Proksi Layanan Hilir (`src/proxies/`)
- `commerce.proxy.ts`: Merutekan ke port **3001**.
- `admin.proxy.ts`: Merutekan ke port **4001** (dan menangani rewrite ke `/management`).
- `geography.proxy.ts`: Menangani passthrough ke API *Emsifa* eksternal.

### Middleware Terpusat
- `auth.ts`: Logika verifikasi ganda (JWT & Internal Key).
- `validate.ts`: Pabrik middleware Joi.
- `error-handler.ts`: Format error JSON tunggal untuk seluruh kegagalan Gateway.

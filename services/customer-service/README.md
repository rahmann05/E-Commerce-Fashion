# Customer Service 👥

Customer Service merupakan tulang punggung _User Identity_ bagi para pelanggan di ekosistem Novarium E-Commerce. Layanan ini membaca dari **Storefront Database** (Supabase/PostgreSQL) namun beroperasi di dalam batasan terpisah (*bounded context*) yang menjamin keamanan data pribadi.

## Tanggung Jawab Domain
- **Pendaftaran & Otentikasi Pengguna:** Login, Sign-up, dan validasi *session cookie* JWT.
- **Manajemen Profil:** Pembaruan nama, profil, nomor telepon, dan data pribadi lainnya.
- **Buku Alamat:** Pengaturan alamat lengkap untuk digunakan dalam ongkos kirim.
- **Keranjang Belanja (Cart):** Fungsi untuk menambah, menghapus, atau memanipulasi *draft* pesanan sebelum dieksekusi.

## Inter-Service Communication 🌐
Customer Service sering kali perlu berbicara dengan *layanan lain*:
- Saat menarik rincian barang dari Keranjang, `customer-service` akan membuat *HTTP direct call* kepada `commerce-service` untuk melakukan *stitching* (penggabungan) data ID menjadi rincian nama dan foto produk untuk ditampilkan ke Frontend (karena database mereka meskipun sama, namun secara arsitektur dipandang sebagai API berbatas ketat).

## Arsitektur Internal
- **Port Layanan:** Terjalan di port `4002`.
- **Rute Utama:** 
  - `/api/customer/auth`
  - `/api/customer/account`
  - `/api/customer/cart`

## Perintah Pengembangan
```bash
# Generate Prisma Client spesifik customer
npx prisma generate

# Menjalankan server dalam mode watch
npm run dev
```

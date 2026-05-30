# Admin Service 🏢

Admin Service adalah backend *microservice* yang bertugas khusus untuk mengatur manajemen hak akses para administrator Novarium, serta menghasilkan agregasi analitik bisnis dari **Operational Database** (Neon/PostgreSQL).

## Tanggung Jawab Domain
- **Manajemen Kredensial Admin:** Otentikasi, otorisasi, dan validasi sesi admin dari _Dashboard_.
- **Dashboard Analytics:** Layanan ini bertanggung jawab atas query-query operasional dan komputasi agregasi untuk menyajikan visualisasi data yang berat, agar *commerce-service* tidak memikul beban *analytics query*.

## Arsitektur Internal
- **Port Layanan:** Terjalan di port `4001` (secara default).
- **Database:** Prisma ORM (Driver: Prisma Pg) terkoneksi ke Operational Database. Model yang dipertahankan hanyalah tabel-tabel spesifik admin (`AdminUser`, dsb).
- **Rute Utama:** 
  - `/api/admin/auth`

## Hubungan Dengan Frontend Admin (`admin-web`)
Penting untuk diketahui bahwa _Dashboard_ **tidak** hanya bergantung pada Admin Service ini. Otentikasi _Dashboard_ memang masuk ke `admin-service`, namun untuk menambah Produk, _Dashboard_ akan langsung memanggil `commerce-service` melalui proxy UI, sehingga `admin-service` menjadi *stateless* dan berfokus murni pada sekuriti tingkat tinggi.

## Perintah Pengembangan
```bash
# Menjalankan mode development
npm run dev
```

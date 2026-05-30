# Order Service 💸

Order Service adalah layanan yang didedikasikan secara mutlak pada transaksi finansial, Checkout, dan integrasi logistik/pembayaran Novarium E-Commerce. Layanan berfokus *Operational Database* (Neon/PostgreSQL).

## Tanggung Jawab Domain
- **Checkout & Pembuatan Pesanan:** Merakit data Keranjang menjadi Pesanan (Order) fisik yang terekam aman (ACID Transaction) di database operasional.
- **Integrasi Pihak Ketiga:**
  - **Payment Gateway (Midtrans):** Meneruskan parameter pembayaran dan menyediakan *webhook listener* untuk menangkap konfirmasi pembayaran sukses secara *realtime*.
  - **Shipping Gateway:** Menerima *request* ongkos kirim dan jarak.
- **Riwayat Transaksi:** Menampilkan pesanan masa lalu untuk pelanggan (Customer) maupun ringkasan seluruh riwayat pesanan (Admin).

## Arsitektur Internal
- **Port Layanan:** Terjalan di port `4003`.
- **Database:** Prisma ORM, dengan fokus model transaksional berat seperti `Order`, `OrderItem`, dan `PaymentStatus`.

## Inter-Service Communication 🌐
Layanan ini memiliki lalu-lintas lintas-layanan (*inter-service traffic*) yang krusial:
1.  **Membaca Keranjang:** Ketika pengguna menekan "Checkout", `order-service` akan langsung menembak API ke `customer-service` untuk mendapatkan data keranjang final.
2.  **Mengecek & Mengurangi Stok:** `order-service` menembak API mutasi stok ke `commerce-service` jika pembayaran valid.
*Semua ini dijalankan melalui `http-client` terpusat milik `@novarium/shared` menggunakan standar `x-internal-key` secara *backend-only*.*

## Perintah Pengembangan
```bash
# Menjalankan layanan order
npm run dev
```

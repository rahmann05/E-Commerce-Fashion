# @novarium/shared 🛠️

`@novarium/shared` merupakan sebuah *internal toolkit library* (berbasis NPM Workspaces) yang memuat berbagai blok fondasi penting untuk mempertahankan standarisasi dari ekosistem Microservices Novarium.

Apabila kita memiliki kode yang harus di-*copy-paste* di lebih dari dua layanan, kode tersebut akan masuk ke dalam paket ini.

## Modul Utama Tersedia:

### 1. `middleware/auth.ts`
Menyediakan utilitas perlindungan rute:
-   `createAuthMiddleware()`: Digunakan di seluruh *service* Express. Secara pintar mendeteksi jenis *request*. Jika *request* berasal dari pengguna eksternal, ia memvalidasi `novarium_jwt`. Jika *request* adalah panggilan kontainer-ke-kontainer (seperti *Order Service* ke *Commerce Service*), ia membaca verifikasi `x-internal-key` di *header*.

### 2. `middleware/cors.ts` & `error-handler.ts`
-   `createCorsMiddleware()`: Menyeragamkan kebijakan penolakan asal-usul asing di tingkat REST API untuk menjamin keamanan dari CSRF.
-   `errorHandler()`: Membentuk struktur *JSON response* `success: false` terpusat (tidak boleh ada respon mentah error HTML).

### 3. `utils/http-client.ts`
-   `createServiceClient(baseURL, internalKey)`: Fungsi *fetch* *wrapper* (Axios-like API) murni bawaan Node, otomatis menginjeksi kunci rahasia internal. *Services* dapat berkomunikasi satu sama lain dengan *client* ini sesederhana memanggil kode asinkron.

### 4. `utils/password.ts`
-   `hashPassword()` & `comparePassword()`: Standar keamanan algoritma penyimpanan kata sandi.

## Manajemen Build
Sebagai _shared library_, repositori ini dikompilasi (di-*build*) sebelum servis lain. Proses ini dijalankan menggunakan `tsc` dasar. Jika Anda mengubah sesuatu di dalam `/src`, jalankan `npm run build` di modul ini, atau seluruh Workspace.

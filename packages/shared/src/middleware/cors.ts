import cors from 'cors';

export function createCorsMiddleware(allowedOrigins: string[]) {
  return cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (server-to-server, Postman)
      if (!origin) return callback(null, true);
      // Izinkan semua localhost saat development
      if (origin.includes('localhost')) return callback(null, true);
      // Cek whitelist
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS tidak diizinkan: ${origin}`));
    },
    credentials: true, // WAJIB untuk cookie auth
  });
}

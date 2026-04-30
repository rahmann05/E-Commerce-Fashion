import { env } from '$env/dynamic/public';

// URL Storefront untuk preview gambar atau link produk
export const STOREFRONT_URL = env.PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

// Gunakan localhost untuk dev, atau URL dari environment variable untuk produksi
const GATEWAY_URL = env.PUBLIC_GATEWAY_URL || 'http://localhost:8000';

// URL Gateway untuk data transaksional (Produk, Pesanan, Kategori - Neon)
export const API_BASE_URL = `${GATEWAY_URL}/api/admin/storefront`;

// URL Gateway untuk data operasional internal (Voucher, Banner, Staff - Supabase)
export const INTERNAL_API_URL = `${GATEWAY_URL}/api/admin/management`;

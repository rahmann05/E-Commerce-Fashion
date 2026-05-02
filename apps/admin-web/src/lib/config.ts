import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';

// URL Storefront untuk preview gambar atau link produk
export const STOREFRONT_URL = env.PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

// URL Utama Gateway (untuk browser)
export const GATEWAY_URL = env.PUBLIC_GATEWAY_URL || 'http://localhost:8000';

// Sisi Server (Docker) harus menggunakan nama service agar bisa saling terhubung
const INTERNAL_GATEWAY = 'http://api-gateway:8000';

// URL Gateway untuk data publik storefront
export const PUBLIC_API_URL = `${GATEWAY_URL}/api/storefront`;

// URL Gateway untuk data transaksional (Produk, Pesanan, dsb)
export const API_BASE_URL = browser 
    ? `${GATEWAY_URL}/api/admin/storefront` 
    : `${INTERNAL_GATEWAY}/api/admin/storefront`;

// URL untuk data operasional internal (Auth, Voucher, dsb)
export const INTERNAL_API_URL = browser 
    ? `${GATEWAY_URL}/api/admin/management` 
    : `${INTERNAL_GATEWAY}/api/admin/management`;

import { env as publicEnv } from '$env/dynamic/public';
import { browser } from '$app/environment';

export const STOREFRONT_URL = publicEnv.PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

/**
 * Helper to resolve the correct API URL based on environment:
 * - Browser: always use the PUBLIC_ url (localhost-based, accessible from the user's browser)
 * - Server (Docker): use INTERNAL_ url (container hostname, e.g. admin-service:4001)
 * - Server (local dev): fallback to PUBLIC_ url or hardcoded localhost
 */
function getServerUrl(internalEnvName: string, publicUrl: string, dockerFallback: string): string {
    if (browser) return publicUrl;
    // On the server, dynamically import private env to get INTERNAL_* URLs
    // We can't statically import $env/dynamic/private in a shared module,
    // so we read from process.env directly (works in adapter-node)
    const internalUrl = process.env[internalEnvName];
    return internalUrl || dockerFallback;
}

export const COMMERCE_API_URL = browser 
    ? (publicEnv.PUBLIC_COMMERCE_API_URL || 'http://localhost:3001/api/commerce/admin')
    : (process.env.INTERNAL_COMMERCE_API_URL || 'http://commerce-service:3001/api/commerce/admin');

export const ADMIN_API_URL = browser 
    ? (publicEnv.PUBLIC_ADMIN_API_URL || 'http://localhost:4001/api/admin')
    : (process.env.INTERNAL_ADMIN_API_URL || 'http://admin-service:4001/api/admin');

export const ORDER_API_URL = browser 
    ? (publicEnv.PUBLIC_ORDER_API_URL || 'http://localhost:4003/api/orders/admin')
    : (process.env.INTERNAL_ORDER_API_URL || 'http://order-service:4003/api/orders/admin');

export function getInternalHeaders(): Record<string, string> {
    if (browser) {
        return {};
    }
    return {
        'x-internal-key': process.env.INTERNAL_SERVICE_KEY || 'novarium-internal-secret-2026'
    };
}

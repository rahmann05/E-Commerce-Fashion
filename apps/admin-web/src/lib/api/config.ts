import { env as publicEnv } from '$env/dynamic/public';
import { browser } from '$app/environment';

export const STOREFRONT_URL = publicEnv.PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

export const COMMERCE_API_URL = browser 
    ? (publicEnv.PUBLIC_COMMERCE_API_URL || 'http://localhost:3001/api/commerce/admin')
    : (publicEnv.PUBLIC_COMMERCE_API_URL || 'http://commerce-service:3001/api/commerce/admin');

export const ADMIN_API_URL = browser 
    ? (publicEnv.PUBLIC_ADMIN_API_URL || 'http://localhost:4001/api/admin')
    : (publicEnv.PUBLIC_ADMIN_API_URL || 'http://admin-service:4001/api/admin');

export const ORDER_API_URL = browser 
    ? (publicEnv.PUBLIC_ORDER_API_URL || 'http://localhost:4003/api/orders/admin')
    : (publicEnv.PUBLIC_ORDER_API_URL || 'http://order-service:4003/api/orders/admin');

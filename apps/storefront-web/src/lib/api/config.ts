/**
 * lib/api/config.ts
 * Centralized API configuration for the Headless Storefront.
 */

export const COMMERCE_API_URL = (() => {
  if (typeof window !== "undefined") return process.env.NEXT_PUBLIC_COMMERCE_API_URL || "http://localhost:3001/api/commerce";
  return process.env.INTERNAL_COMMERCE_API_URL || process.env.NEXT_PUBLIC_COMMERCE_API_URL || "http://commerce-service:3001/api/commerce";
})();

export const CUSTOMER_API_URL = (() => {
  if (typeof window !== "undefined") return process.env.NEXT_PUBLIC_CUSTOMER_API_URL || "http://localhost:4002/api/customer";
  return process.env.INTERNAL_CUSTOMER_API_URL || process.env.NEXT_PUBLIC_CUSTOMER_API_URL || "http://customer-service:4002/api/customer";
})();

export const ORDER_API_URL = (() => {
  if (typeof window !== "undefined") return process.env.NEXT_PUBLIC_ORDER_API_URL || "http://localhost:4003/api/orders";
  return process.env.INTERNAL_ORDER_API_URL || process.env.NEXT_PUBLIC_ORDER_API_URL || "http://order-service:4003/api/orders";
})();

/**
 * Standard fetch options for Headless API calls.
 */
export const fetchOptions = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Required for cookie-based authentication
    credentials: "include",
  };
};

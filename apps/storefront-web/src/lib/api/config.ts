/**
 * lib/api/config.ts
 * Centralized API configuration for the Headless Storefront.
 */

const getApiBaseUrl = () => {
  // Browser side (Client Components)
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/storefront";
  }
  
  // Server side (Server Components / Actions)
  // Inside Docker, use the internal service name. 
  // If not in Docker (local dev), use localhost.
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://api-gateway:8000/api/storefront";
};

export const API_BASE_URL = getApiBaseUrl();

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

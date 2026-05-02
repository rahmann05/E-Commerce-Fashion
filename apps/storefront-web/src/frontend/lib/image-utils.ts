/**
 * lib/image-utils.ts
 * Utility for handling image URLs, especially for Supabase Storage.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SUPABASE_URL) {
  if (process.env.NODE_ENV === 'development') {
    console.warn("NEXT_PUBLIC_SUPABASE_URL is missing in storefront-web");
  }
}

const BUCKET_NAME = "products";

/**
 * Transforms a local path or filename into a full Supabase Storage URL.
 * If the input is already a full URL (http/https), it returns it as-is.
 * 
 * @param path The local path or filename (e.g., "/images/tees1.png" or "tees1.png")
 * @returns The full Supabase Storage URL or an empty string if none
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";

  // If it's already an absolute URL, data URI, or a root-relative local path, return it
  if (
    path.startsWith("http://") || 
    path.startsWith("https://") || 
    path.startsWith("data:") ||
    path.startsWith("/")
  ) {
    return path;
  }

  // Clean up path: strip 'images/' prefix if it exists but is not root-relative
  let cleanPath = path;
  if (cleanPath.startsWith("images/")) cleanPath = cleanPath.slice(7);

  // If SUPABASE_URL is missing, we must NOT fallback to local. Return empty.
  if (!SUPABASE_URL) {
    return "";
  }

  // Ensure no trailing slash on SUPABASE_URL
  const baseUrl = SUPABASE_URL.endsWith("/") ? SUPABASE_URL.slice(0, -1) : SUPABASE_URL;
  
  return `${baseUrl}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
}

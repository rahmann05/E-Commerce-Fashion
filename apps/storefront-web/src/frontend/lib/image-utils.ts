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
 * @returns The full Supabase Storage URL
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/images/placeholder.png";

  // If it's already an absolute URL or data URI, return it
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  // Clean up path: strip leading slash and 'images/' prefix
  let cleanPath = path;
  if (cleanPath.startsWith("/")) cleanPath = cleanPath.slice(1);
  if (cleanPath.startsWith("images/")) cleanPath = cleanPath.slice(7);

  // If SUPABASE_URL is missing, fallback to local /images/ path
  if (!SUPABASE_URL) {
    return `/images/${cleanPath}`;
  }

  // Ensure no trailing slash on SUPABASE_URL
  const baseUrl = SUPABASE_URL.endsWith("/") ? SUPABASE_URL.slice(0, -1) : SUPABASE_URL;
  
  return `${baseUrl}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
}

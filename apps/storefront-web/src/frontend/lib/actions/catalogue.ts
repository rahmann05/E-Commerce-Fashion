/**
 * lib/actions/catalogue.ts
 * Server Actions for the catalogue page.
 * Fetches data via API Gateway (Headless Engine).
 */

"use server";

import type { CatalogueProduct } from "@/components/catalogue/types";
import { getImageUrl } from "@/frontend/lib/image-utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CategoryFilter = "all" | "tees" | "jeans" | "accessories" | "outerwear" | "editorial";

// Use NEXT_PUBLIC_API_URL if available (client/server), otherwise fallback for server-side internal networking
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "/api";
  }
  // Server-side: prefer internal networking if specified, otherwise fallback
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://api-gateway:8000/api/storefront";
};

const API_BASE_URL = getApiBaseUrl();

const PRODUCT_COLOR_MAP: Record<string, string> = {
  "tees1.png": "#e8e8e8",
  "tees2.png": "#6b4423",
  "tees3.png": "#8da38a",
  "tees4.png": "#7a7a7a",
  "tees5.png": "#333333",
  "tees6.png": "#f5f5dc",
  "tees7.png": "#556b2f",
  "jeans1.png": "#2b4c7e",
  "jeans2.png": "#1a1a1a",
  "jeans3.png": "#5b84b1",
  "jeans4.png": "#16213e",
  "jeans5.png": "#2d2d2d",
  "jeans6.png": "#0f172a",
  "outerwear1.png": "#1a1a1a",
  "outerwear2.png": "#2d2d2d",
  "outerwear3.png": "#556b2f",
  "outerwear4.png": "#16213e",
  "outerwear5.png": "#6b4423",
  "accessories1.png": "#111111",
  "accessories2.png": "#1a1a1a",
  "accessories3.png": "#c0c0c0",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function rowToProduct(
  row: any
): CatalogueProduct {
  const options = row.sizeOptions || [];
  const stocks = row.sizeStocks || [];
  const images = row.image || [];
  const primaryImage = images[0] || "";
  const fallbackColor = PRODUCT_COLOR_MAP[primaryImage] ? [PRODUCT_COLOR_MAP[primaryImage]] : ["#111"];
  const colors = row.colors && row.colors.length > 0 ? row.colors : fallbackColor;
  const variants = row.variants || [];

  const categoryName = (row.category?.name || "editorial").toLowerCase();
  const category = (["tees", "jeans", "accessories", "outerwear", "editorial"].includes(categoryName)
    ? categoryName
    : "editorial") as CatalogueProduct["category"];

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    category,
    price: Number(row.price),
    rating: row.rating ?? 5,
    sizes:
      row.sizes ??
      (options.length > 0
        ? options.length > 1
          ? `${options[0]} - ${options[options.length - 1]}`
          : options[0]
        : "S - XXL"),
    image: getImageUrl(images[0] ?? "/images/tees1.png"),
    colors: colors,
    sizeOptions: options,
    sizeStocks: stocks,
    inStock: row.inStock && (variants.length === 0 || variants.some((v: any) => v.stock > 0)),
    variants: variants.map((v: any) => ({
      id: v.id,
      productId: row.id,
      size: v.size,
      color: v.color ?? undefined,
      stock: v.stock,
    })),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch products via API Gateway.
 */
export async function getProducts(
  category: CategoryFilter = "all"
): Promise<CatalogueProduct[]> {
  try {
    let urlString = `${API_BASE_URL}/products`;
    if (category !== "all") {
      urlString += `?category=${category}`;
    }

    const res = await fetch(urlString, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch products");

    const result = await res.json();
    if (!result.success) throw new Error(result.error || "Failed to fetch products");

    return result.data.map(rowToProduct);
  } catch (err: any) {
    console.error("[API] getProducts failed:", err);
    return []; // Return empty on error to prevent page crash
  }
}

/**
 * Fetch a single product by ID.
 */
export async function getProductById(
  id: string
): Promise<CatalogueProduct | null> {
  try {
    const urlString = `${API_BASE_URL}/products/${id}`;
    const res = await fetch(urlString, { cache: "no-store" });
    if (!res.ok) return null;

    const result = await res.json();
    if (!result.success) return null;

    return rowToProduct(result.data);
  } catch (err) {
    console.error("[API] getProductById failed:", err);
    return null;
  }
}

export async function getTees(): Promise<CatalogueProduct[]> {
  return getProducts("tees");
}

export async function getJeans(): Promise<CatalogueProduct[]> {
  return getProducts("jeans");
}

export async function getCarouselImages(): Promise<string[]> {
  try {
    const products = await getProducts("all");
    // Only show tees and jeans in ScienceSection marquee as requested
    const filtered = products.filter(p => 
      p.category === "tees" || p.category === "jeans"
    );
    return filtered.flatMap(p => p.image).filter((img): img is string => Boolean(img));
  } catch (err) {
    console.error("[API] getCarouselImages failed:", err);
    return [];
  }
}

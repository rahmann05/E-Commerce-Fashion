/**
 * lib/actions/catalogue.ts
 * Server Actions for the catalogue page.
 * Uses the pure catalogueApi client.
 */

"use server";

import { catalogueApi, type CategoryFilter } from "@/shared/api/catalogue";
import type { CatalogueProduct } from "@/features/catalogue/types";


/**
 * Fetch products via pure API client.
 */
export async function getProducts(category: CategoryFilter = "all"): Promise<CatalogueProduct[]> {
  try {
    return await catalogueApi.getProducts(category);
  } catch (err) {
    console.error("[Action] getProducts failed:", err);
    return [];
  }
}

/**
 * Fetch a single product by ID via pure API client.
 */
export async function getProductById(id: string): Promise<CatalogueProduct | null> {
  return await catalogueApi.getProductById(id);
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
    const filtered = products.filter(p => 
      p.category === "tees" || p.category === "jeans"
    );
    return filtered.map(p => p.image).filter((img): img is string => Boolean(img));
  } catch (err) {
    console.error("[Action] getCarouselImages failed:", err);
    return [];
  }
}

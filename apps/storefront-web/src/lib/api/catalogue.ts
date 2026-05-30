/**
 * lib/api/catalogue.ts
 * Pure API client for Catalogue domain.
 */

import { COMMERCE_API_URL, fetchOptions } from "./config";
import type { CatalogueProduct } from "@/features/catalogue/types";
import { getImageUrl } from "@/lib/image-utils";

export type CategoryFilter = "all" | "tees" | "jeans" | "accessories" | "outerwear" | "editorial";

function rowToProduct(row: Record<string, unknown>): CatalogueProduct {
  const options = (row.sizeOptions as string[]) || [];
  const stocks = (row.sizeStocks as number[]) || [];
  const images = (row.image as string[]) || [];
  const colors = (row.colors as string[]) || [];
  const variants = (row.variants as Record<string, unknown>[]) || [];

  const categoryName = ((row.category as Record<string, unknown>)?.name as string || "editorial").toLowerCase();
  const category = (["tees", "jeans", "accessories", "outerwear", "editorial"].includes(categoryName)
    ? categoryName
    : "editorial") as CatalogueProduct["category"];

  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    category,
    price: Number(row.price),
    rating: (row.rating as number) ?? 5,
    sizes:
      (row.sizes as string) ??
      (options.length > 0
        ? options.length > 1
          ? `${options[0]} - ${options[options.length - 1]}`
          : options[0]
        : "S - XXL"),
    image: getImageUrl(images[0]),
    colors: colors,
    sizeOptions: options,
    sizeStocks: stocks,
    inStock: (row.inStock as boolean) && (variants.length === 0 || (variants as Array<{ stock: number }>).some((v) => v.stock > 0)),
    variants: (variants as Array<{ id: string; size: string; color?: string; stock: number }>).map((v) => ({
      id: v.id,
      productId: row.id as string,
      size: v.size,
      color: v.color ?? undefined,
      stock: v.stock,
    })),
  };
}

export const catalogueApi = {
  /**
   * Get all products or filter by category
   */
  async getProducts(category: CategoryFilter = "all"): Promise<CatalogueProduct[]> {
    let urlString = `${COMMERCE_API_URL}/products`;
    if (category !== "all") {
      urlString += `?categoryName=${category}`;
    }

    const res = await fetch(urlString, fetchOptions({ cache: "no-store" }));
    if (!res.ok) throw new Error("Failed to fetch products");

    const result = await res.json() as { success: boolean; data: Record<string, unknown>[]; error?: string };
    if (!result.success) throw new Error(result.error || "Failed to fetch products");

    return result.data.map(rowToProduct);
  },

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<CatalogueProduct | null> {
    try {
      const urlString = `${COMMERCE_API_URL}/products/${id}`;
      const res = await fetch(urlString, fetchOptions({ cache: "no-store" }));
      if (!res.ok) return null;

      const result = await res.json() as { success: boolean; data: Record<string, unknown> };
      if (!result.success) return null;

      return rowToProduct(result.data);
    } catch (err) {
      console.error("[catalogueApi] getProductById failed:", err);
      return null;
    }
  }
};

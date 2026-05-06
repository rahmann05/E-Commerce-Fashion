/**
 * lib/api/catalogue.ts
 * Pure API client for Catalogue domain.
 */

import { API_BASE_URL, fetchOptions } from "./config";
import type { CatalogueProduct } from "@/features/catalogue/types";
import { getImageUrl } from "@/lib/image-utils";

export type CategoryFilter = "all" | "tees" | "jeans" | "accessories" | "outerwear" | "editorial";

function rowToProduct(row: any): CatalogueProduct {
  const options = row.sizeOptions || [];
  const stocks = row.sizeStocks || [];
  const images = row.image || [];
  const colors = row.colors || [];
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
    image: getImageUrl(images[0]),
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

export const catalogueApi = {
  /**
   * Get all products or filter by category
   */
  async getProducts(category: CategoryFilter = "all"): Promise<CatalogueProduct[]> {
    let urlString = `${API_BASE_URL}/products`;
    if (category !== "all") {
      urlString += `?category=${category}`;
    }

    const res = await fetch(urlString, fetchOptions({ cache: "no-store" }));
    if (!res.ok) throw new Error("Failed to fetch products");

    const result = await res.json();
    if (!result.success) throw new Error(result.error || "Failed to fetch products");

    return result.data.map(rowToProduct);
  },

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<CatalogueProduct | null> {
    try {
      const urlString = `${API_BASE_URL}/products/${id}`;
      const res = await fetch(urlString, fetchOptions({ cache: "no-store" }));
      if (!res.ok) return null;

      const result = await res.json();
      if (!result.success) return null;

      return rowToProduct(result.data);
    } catch (err) {
      console.error("[catalogueApi] getProductById failed:", err);
      return null;
    }
  }
};

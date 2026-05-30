import { useState, useMemo } from "react";
import type { CatalogueProduct } from "../types";
import type { CategoryFilter } from "@/shared/api/catalogue";

export function useCatalogue(initialProducts: CatalogueProduct[]) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "default">("default");
  const [selectedProduct, setSelectedProduct] = useState<CatalogueProduct | null>(null);

  const filtered = useMemo(() => {
    let list =
      activeCategory === "all"
        ? initialProducts
        : initialProducts.filter((p) => p.category === activeCategory);

    if (sortOrder === "asc")  list = [...list].sort((a, b) => a.price - b.price);
    if (sortOrder === "desc") list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [initialProducts, activeCategory, sortOrder]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all:         initialProducts.length,
      tees:        initialProducts.filter((p) => p.category === "tees").length,
      jeans:       initialProducts.filter((p) => p.category === "jeans").length,
      outerwear:   initialProducts.filter((p) => p.category === "outerwear").length,
      accessories: initialProducts.filter((p) => p.category === "accessories").length,
      editorial:   initialProducts.filter((p) => p.category === "editorial").length,
    };
    return c;
  }, [initialProducts]);

  return {
    state: {
      activeCategory,
      sortOrder,
      selectedProduct,
      filtered,
      counts
    },
    actions: {
      setActiveCategory,
      setSortOrder,
      setSelectedProduct
    }
  };
}

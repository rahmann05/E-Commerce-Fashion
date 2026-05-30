"use client";

import type { CatalogueProduct } from "../types";
import type { CategoryFilter } from "@/shared/api/catalogue";
import CatalogueFilterSidebar from "./CatalogueFilterSidebar";
import CatalogueGrid from "./CatalogueGrid";
import ProductDetailModal from "./ProductDetailModal";
import CatalogueWaveSection from "./CatalogueWaveSection";

import { useCatalogue } from "../hooks/useCatalogue";

interface Props {
  initialProducts: CatalogueProduct[];
}

export default function CatalogueClient({ initialProducts }: Props) {
  const { state, actions } = useCatalogue(initialProducts);
  const { activeCategory, sortOrder, selectedProduct, filtered, counts } = state;
  const { setActiveCategory, setSortOrder, setSelectedProduct } = actions;

  return (
    <div className="catalogue-page">
      <CatalogueWaveSection />
      {/* Products body */}
      <div id="catalogue-grid" className="catalogue-body">
        <CatalogueFilterSidebar
          activeCategory={activeCategory}
          counts={counts}
          onCategoryChange={setActiveCategory}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
        <CatalogueGrid
          products={filtered}
          onSelectProduct={setSelectedProduct}
        />
      </div>

      {/* Product detail modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}


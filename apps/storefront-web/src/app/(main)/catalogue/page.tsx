/**
 * app/catalogue/page.tsx
 *
 * Server Component — fetches products from MySQL on the server.
 * Passes data down to CatalogueClient (Client Component) for interactivity.
 */

import type { Metadata } from "next";
import CatalogueHero from "@/features/catalogue/components/CatalogueHero";
import CatalogueClient from "@/features/catalogue/components/CatalogueClient";
import { getProducts } from "@/shared/api/actions/catalogue";
import styles from "@/shared/styles/catalogue-page.module.css";

export const metadata: Metadata = {
  title: "Catalogue | Novarium — Essentialized Daily Wear",
  description:
    "Browse the full Novarium collection — premium tees, denim, and accessories crafted for modern everyday wear.",
};

// Revalidate every 60s so new DB entries show up without a full deploy
export const revalidate = 60;

export default async function CataloguePage() {
  const products = await getProducts("all");

  return (
    <main className={styles.catalogueMain}>
      <CatalogueHero />
      <CatalogueClient initialProducts={products} />
    </main>
  );
}

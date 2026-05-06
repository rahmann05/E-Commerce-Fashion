/**
 * lib/api/products.ts
 * API client for Catalog and Product management.
 */

import { API_BASE_URL } from "./config";

export const productsApi = {
  /**
   * Get products with optional search and category filters
   */
  async getProducts(fetch: any, query = '', category = '') {
    try {
      let url = `${API_BASE_URL}?q=${query}`;
      if (category) url += `&category=${category}`;
      
      const res = await fetch(url);
      if (!res.ok) return { data: [], error: `Fetch failed: ${res.status}` };
      return await res.json();
    } catch (e: any) {
      console.error(`[productsApi] Error:`, e.message);
      return { data: [], error: e.message };
    }
  },

  /**
   * Get product by ID
   */
  async getProductById(fetch: any, id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`);
      if (!res.ok) return { data: null };
      return await res.json();
    } catch (e: any) {
      console.error(`[productsApi] Error:`, e.message);
      return { data: null };
    }
  },

  /**
   * Get all categories
   */
  async getCategories(fetch: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) return { data: [] };
      return await res.json();
    } catch (e: any) {
      return { data: [] };
    }
  }
};

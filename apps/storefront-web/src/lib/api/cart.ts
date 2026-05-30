/**
 * lib/api/cart.ts
 * Pure API client for Cart management.
 */

import { CUSTOMER_API_URL, fetchOptions } from "./config";

export const cartApi = {
  /**
   * Get current user's cart
   */
  async getCart() {
    const res = await fetch(`${CUSTOMER_API_URL}/cart`, fetchOptions());
    if (!res.ok) throw new Error("Failed to fetch cart");
    return await res.json();
  },

  /**
   * Add item to cart
   */
  async addToCart(productId: string, productVariantId: string, quantity: number) {
    const res = await fetch(`${CUSTOMER_API_URL}/cart`, fetchOptions({
      method: "POST",
      body: JSON.stringify({ productId, productVariantId, quantity }),
    }));
    return await res.json();
  },

  /**
   * Update item quantity
   */
  async updateQuantity(itemId: string, quantity: number) {
    const res = await fetch(`${CUSTOMER_API_URL}/cart`, fetchOptions({
      method: "PUT",
      body: JSON.stringify({ itemId, quantity }),
    }));
    return await res.json();
  },

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string) {
    const res = await fetch(`${CUSTOMER_API_URL}/cart/${itemId}`, fetchOptions({
      method: "DELETE",
    }));
    return await res.json();
  },

  /**
   * Clear cart
   */
  async clearCart() {
    const res = await fetch(`${CUSTOMER_API_URL}/cart`, fetchOptions({
      method: "PATCH",
    }));
    return await res.json();
  }
};

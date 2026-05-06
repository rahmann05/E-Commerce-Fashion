/**
 * lib/api/orders.ts
 * API client for Order and Transaction management.
 */

import { API_BASE_URL } from "./config";

export const ordersApi = {
  /**
   * Get all orders or filter by limit
   */
  async getOrders(fetch: any, limit?: number) {
    try {
      let url = `${API_BASE_URL}/orders`;
      if (limit) url += `?limit=${limit}`;
      
      const res = await fetch(url);
      if (!res.ok) return { data: [], error: `Fetch failed: ${res.status}` };
      return await res.json();
    } catch (e: any) {
      console.error(`[ordersApi] Error:`, e.message);
      return { data: [], error: e.message };
    }
  },

  /**
   * Get order details by ID
   */
  async getOrderById(fetch: any, id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`);
      if (!res.ok) return { data: null };
      return await res.json();
    } catch (e: any) {
      console.error(`[ordersApi] Error:`, e.message);
      return { data: null };
    }
  }
};

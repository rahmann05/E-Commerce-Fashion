/**
 * lib/api/orders.ts
 * API client for Order and Transaction management.
 */

import { ORDER_API_URL, getInternalHeaders } from "./config";

export const orderApi = {
  /**
   * Get all orders or filter by limit
   */
  async getOrders(fetch: any, limit?: number) {
    try {
      let url = `${ORDER_API_URL}`;
      if (limit) url += `?limit=${limit}`;
      
      const res = await fetch(url, { headers: { ...getInternalHeaders() } });
      if (!res.ok) return { data: [], error: `Fetch failed: ${res.status}` };
      return await res.json();
    } catch (e: any) {
      console.error(`[orderApi] Error:`, e.message);
      return { data: [], error: e.message };
    }
  },

  /**
   * Get order details by ID
   */
  async getOrderById(fetch: any, id: string) {
    try {
      const res = await fetch(`${ORDER_API_URL}/${id}`, { headers: { ...getInternalHeaders() } });
      if (!res.ok) return { data: null };
      return await res.json();
    } catch (e: any) {
      console.error(`[orderApi] Error:`, e.message);
      return { data: null };
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(fetch: any, id: string, status: string) {
    try {
      const res = await fetch(`${ORDER_API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getInternalHeaders()
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) return { success: false, error: `Update failed: ${res.status}` };
      return await res.json();
    } catch (e: any) {
      console.error(`[orderApi] Error:`, e.message);
      return { success: false, error: e.message };
    }
  },

  async getReturns(fetch: any) {
    try {
      const res = await fetch(`${ORDER_API_URL}/returns/all`, { headers: { ...getInternalHeaders() } });
      if (!res.ok) return { data: [] };
      return await res.json();
    } catch (e: any) {
      console.error(`[orderApi] Error fetching returns:`, e.message);
      return { data: [] };
    }
  }
};


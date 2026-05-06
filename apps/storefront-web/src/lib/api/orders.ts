/**
 * lib/api/orders.ts
 * API client for Order and Checkout management.
 */

import { API_BASE_URL, fetchOptions } from "./config";

export const ordersApi = {
  /**
   * Create a new order (Checkout)
   */
  async createOrder(orderData: any) {
    const res = await fetch(`${API_BASE_URL}/checkout`, fetchOptions({
      method: "POST",
      body: JSON.stringify(orderData),
    }));
    return await res.json();
  },

  /**
   * Get order history for current user
   */
  async getMyOrders() {
    const res = await fetch(`${API_BASE_URL}/orders`, fetchOptions());
    if (!res.ok) throw new Error("Failed to fetch orders");
    return await res.json();
  },

  /**
   * Get specific order details
   */
  async getOrderDetails(orderId: string) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, fetchOptions());
    if (!res.ok) throw new Error("Failed to fetch order details");
    return await res.json();
  }
};

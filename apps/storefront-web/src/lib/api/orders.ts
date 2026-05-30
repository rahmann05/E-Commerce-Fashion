/**
 * lib/api/orders.ts
 * API client for Order and Checkout management.
 */

import { CUSTOMER_API_URL, fetchOptions } from "./config";

export interface OrderResponse {
  success: boolean;
  data: Record<string, unknown>;
  error?: string;
}

export interface OrdersListResponse {
  success: boolean;
  data: Record<string, unknown>[];
  error?: string;
}

export const ordersApi = {
  /**
   * Create a new order (Checkout)
   */
  async createOrder(orderData: Record<string, unknown>): Promise<{ success: boolean; orderId?: string; error?: string }> {
    const res = await fetch(`${CUSTOMER_API_URL}/checkout`, fetchOptions({
      method: "POST",
      body: JSON.stringify(orderData),
    }));
    return await res.json();
  },

  /**
   * Get order history for current user
   */
  async getMyOrders(): Promise<OrdersListResponse> {
    const res = await fetch(`${CUSTOMER_API_URL}/orders`, fetchOptions());
    if (!res.ok) throw new Error("Failed to fetch orders");
    return await res.json();
  },

  /**
   * Get specific order details
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    const res = await fetch(`${CUSTOMER_API_URL}/orders/${orderId}`, fetchOptions());
    if (!res.ok) throw new Error("Failed to fetch order details");
    return await res.json();
  },

  /**
   * Initiate Midtrans payment charge
   */
  async initiateMidtransCharge(params: { order_id: string; payment_type: string; bank?: string; customer_details: Record<string, unknown> }): Promise<{ success: boolean; data: Record<string, unknown>; error?: string }> {
    const res = await fetch(`${CUSTOMER_API_URL}/checkout/midtrans`, fetchOptions({
      method: "POST",
      body: JSON.stringify(params),
    }));
    return await res.json();
  },

  /**
   * Get Midtrans payment status
   */
  async getMidtransStatus(orderId: string): Promise<{ success: boolean; data: Record<string, unknown>; error?: string }> {
    const res = await fetch(`${CUSTOMER_API_URL}/checkout/midtrans/status?orderId=${orderId}`, fetchOptions());
    return await res.json();
  }
};

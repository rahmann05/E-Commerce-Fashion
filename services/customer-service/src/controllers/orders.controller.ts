import { createServiceClient } from '@novarium/shared';
import { env } from '../config/env.js';

const orderClient = createServiceClient(env.ORDER_SERVICE_URL, env.INTERNAL_SERVICE_KEY);

export class OrdersController {
  static async getOrders(userId: string) {
    try {
      const res = await orderClient.get(`/api/orders/customer/${userId}`);
      return res;
    } catch (err: any) {
      console.error('[OrdersController] Failed to get orders:', err.message);
      return { data: [] };
    }
  }

  static async getOrderDetails(userId: string, orderId: string) {
    try {
      const res = await orderClient.get(`/api/orders/customer/${userId}/${orderId}`);
      return res;
    } catch (err: any) {
      throw new Error(`Failed to get order details: ${err.message}`);
    }
  }
}

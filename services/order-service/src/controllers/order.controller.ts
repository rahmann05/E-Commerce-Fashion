import { prisma } from '../db/client.js';
import { createServiceClient } from '@novarium/shared';
import { env } from '../config/env.js';

const commerceClient = createServiceClient(env.COMMERCE_SERVICE_URL, env.INTERNAL_SERVICE_KEY);

export class OrderController {
  static async getCustomerOrders(req: any, res: any) {
    try {
      const { customerId } = req.params;
      const orders = await prisma.order.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      });

      // Hydrate with product names
      const mappedOrders = await Promise.all(orders.map(async (order: any) => {
        const primaryItem = order.items[0];
        let hydratedItem: any = primaryItem ? { ...primaryItem } : null;
        
        if (primaryItem) {
          try {
            const productRes = await commerceClient.get(`/api/commerce/products/${primaryItem.productId}`) as any;
            if (productRes.success && productRes.data) {
              hydratedItem.name = productRes.data.name;
              hydratedItem.imageUrl = productRes.data.imageUrl || '/images/about/model1.png';
            }
          } catch(e) {
            hydratedItem.name = 'Pesanan';
          }
        }
        return {
          ...order,
          items: hydratedItem ? [hydratedItem, ...order.items.slice(1)] : []
        };
      }));

      res.json({ success: true, data: mappedOrders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getCustomerOrderDetails(req: any, res: any) {
    try {
      const { customerId, orderId } = req.params;
      const order = await prisma.order.findUnique({
        where: { id: orderId, customerId },
        include: { items: true, tracking: true }
      });
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      res.json({ success: true, data: order });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getAdminOrders(req: any, res: any) {
    try {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      });
      res.json({ success: true, data: orders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getAdminOrderDetails(req: any, res: any) {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true, tracking: true }
      });
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      res.json({ success: true, data: order });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

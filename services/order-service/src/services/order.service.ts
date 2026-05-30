import { prisma } from '../db/client.js';
import { createServiceClient } from '@novarium/shared';
import { env } from '../config/env.js';

const commerceClient = createServiceClient(env.COMMERCE_SERVICE_URL, env.INTERNAL_SERVICE_KEY);

export class OrderService {
  static async getCustomerOrders(customerId: string) {
    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

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

    return mappedOrders;
  }

  static async getCustomerOrderDetails(customerId: string, orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId, customerId },
      include: { items: true, tracking: true }
    });
  }

  static async getAdminOrders() {
    return prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });
  }

  static async getAdminOrderDetails(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true, tracking: true }
    });
  }
}

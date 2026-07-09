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
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });
    return orders.map(order => {
      let customer = { name: 'Guest', phone: '' };
      if (order.addressSnapshot) {
        try {
          const addr = typeof order.addressSnapshot === 'string' ? JSON.parse(order.addressSnapshot) : order.addressSnapshot;
          if (addr.recipient) customer.name = addr.recipient;
          if (addr.phone) customer.phone = addr.phone;
        } catch(e) {}
      }
      return { ...order, customer };
    });
  }

  static async getAdminOrderDetails(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, tracking: true }
    });
    if (!order) return null;
    let customer = { name: 'Guest', email: '', phone: '' };
    if (order.addressSnapshot) {
      try {
        const addr = typeof order.addressSnapshot === 'string' ? JSON.parse(order.addressSnapshot) : order.addressSnapshot;
        if (addr.recipient) customer.name = addr.recipient;
        if (addr.phone) customer.phone = addr.phone;
      } catch(e) {}
    }
    return { ...order, customer };
  }

  static async updateAdminOrderStatus(id: string, status: any) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }

  static async getAdminReturns() {
    return prisma.returnRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: { items: true }
        }
      }
    });
  }

  static async updateAdminReturnStatus(id: string, status: string) {
    const returnRequest = await prisma.returnRequest.update({
      where: { id },
      data: { status }
    });

    if (status === 'APPROVED') {
      await prisma.order.update({
        where: { id: returnRequest.orderId },
        data: { status: 'RETURNED' }
      });
      // Optionally sync with commerce-service to restock here later
    } else if (status === 'REJECTED') {
      // Revert order status to delivered
      await prisma.order.update({
        where: { id: returnRequest.orderId },
        data: { status: 'DELIVERED' }
      });
    }

    return returnRequest;
  }
}

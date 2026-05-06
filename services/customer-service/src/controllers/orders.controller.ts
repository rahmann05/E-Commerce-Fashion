import { prisma } from '../db/client';

const GATEWAY_URL = process.env.INTERNAL_API_URL || 'http://api-gateway:8000/api/storefront';
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY;

async function fetchProduct(productId: string) {
  try {
    const res = await fetch(`${GATEWAY_URL}/products/${productId}`, {
      headers: {
        'x-internal-key': INTERNAL_KEY || ''
      }
    });
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.data;
  } catch (err) {
    console.error(`Error fetching product ${productId} via Gateway:`, err);
    return null;
  }
}

export class OrdersController {
  static async getOrders(userId: string) {
    const orders = await prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      }
    });

    const mappedOrders = await Promise.all(orders.map(async (order) => {
      const primaryItem = order.items[0];
      let hydratedItem: any = primaryItem ? { ...primaryItem } : null;
      
      if (primaryItem) {
        const product = await fetchProduct(primaryItem.productId);
        if (product) {
          hydratedItem.name = product.name;
          hydratedItem.imageUrl = product.imageUrl || (product.image && product.image[0]) || (product.images && product.images[0]) || '/images/about/model1.png';
        } else {
          hydratedItem.name = 'Pesanan';
          hydratedItem.imageUrl = '/images/about/model1.png';
        }
        hydratedItem.unitPrice = Number(primaryItem.price);
      }

      return {
        ...order,
        total: Number(order.totalAmount),
        shipping: 0,
        items: hydratedItem ? [hydratedItem, ...order.items.slice(1)] : []
      };
    }));

    return { data: mappedOrders };
  }

  static async getOrderDetails(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
        customerId: userId
      },
      include: {
        items: true
      }
    });

    if (!order) throw new Error('Order not found');

    const hydratedItems = await Promise.all(
      order.items.map(async (item: any) => {
        const product = await fetchProduct(item.productId);
        return {
          ...item,
          product,
          unitPrice: Number(item.price)
        };
      })
    );

    return { 
      data: { 
        ...order, 
        total: Number(order.totalAmount),
        items: hydratedItems 
      }
    };
  }
}

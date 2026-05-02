import { Router } from 'express';
import { prisma } from '../infrastructure/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Internal URL for Commerce Service to fetch product data directly
const COMMERCE_SERVICE_URL = process.env.COMMERCE_SERVICE_URL || 'http://commerce-service:3001';

router.use(authenticateJWT);

async function fetchProduct(productId: string) {
  try {
    const res = await fetch(`${COMMERCE_SERVICE_URL}/api/products/${productId}`);
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.data;
  } catch (err) {
    console.error(`Error fetching product ${productId}:`, err);
    return null;
  }
}

// GET / - List orders for current customer
router.get('/', async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.id;

    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      }
    });

    console.log(`[Orders] Found ${orders.length} orders for customer ${customerId}`);

    // Map Prisma totalAmount to total for frontend consistency
    // Hydrate the FIRST item of each order so the list view has product info
    const mappedOrders = await Promise.all(orders.map(async (order) => {
      const primaryItem = order.items[0];
      let hydratedItem: any = primaryItem ? { ...primaryItem } : null;
      
      if (primaryItem) {
        const product = await fetchProduct(primaryItem.productId);
        if (product) {
          hydratedItem.name = product.name;
          hydratedItem.imageUrl = product.imageUrl || (product.image && product.image[0]) || (product.images && product.images[0]) || '/images/about/model1.png';
          console.log(`[Orders] Hydrated item for order ${order.id}: ${hydratedItem.name}, img: ${hydratedItem.imageUrl}`);
        } else {
          console.warn(`[Orders] Failed to fetch product ${primaryItem.productId} for order ${order.id}`);
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

    res.json({
      success: true,
      data: mappedOrders,
      message: 'Orders retrieved'
    });
  } catch (error) {
    console.error('[Orders] GET List Error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /:id - Get order details
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.id;
    const { id } = req.params as { id: string };

    const order = await prisma.order.findUnique({
      where: { 
        id,
        customerId
      },
      include: {
        items: true
      }
    });

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Hydrate items with product data
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

    res.json({
      success: true,
      data: { 
        ...order, 
        total: Number(order.totalAmount),
        items: hydratedItems 
      },
      message: 'Order details retrieved'
    });
  } catch (error) {
    console.error('[Orders] GET Detail Error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;

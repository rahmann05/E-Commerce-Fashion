import { Router } from 'express';
import { prisma } from '../infrastructure/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Internal URL for API Gateway to fetch product data
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://api-gateway:8000/api/admin/storefront';

router.use(authenticateJWT);

async function fetchProduct(productId: string) {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/products/${productId}`);
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
        _count: {
          select: { items: true }
        }
      }
    });

    res.json({
      success: true,
      data: orders,
      message: 'Orders retrieved'
    });
  } catch (error) {
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
          product
        };
      })
    );

    res.json({
      success: true,
      data: { ...order, items: hydratedItems },
      message: 'Order details retrieved'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;

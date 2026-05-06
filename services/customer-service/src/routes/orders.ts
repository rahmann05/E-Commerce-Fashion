import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// GET / - List orders for current customer
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await OrdersController.getOrders(req.user!.id);
    res.json({
      success: true,
      ...result,
      message: 'Orders retrieved'
    });
  } catch (error: any) {
    console.error('[Orders] GET List Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /:id - Get order details
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const result = await OrdersController.getOrderDetails(req.user!.id, id);
    res.json({
      success: true,
      ...result,
      message: 'Order details retrieved'
    });
  } catch (error: any) {
    console.error('[Orders] GET Detail Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller.js';
import { createAuthMiddleware, AuthRequest } from '@novarium/shared';
import { env } from '../config/env.js';

const router = Router();
const auth = createAuthMiddleware(env.JWT_SECRET, env.INTERNAL_SERVICE_KEY);

router.use(auth);

// GET / - List orders for current customer
router.get('/', async (req: any, res) => {
  try {
    const result = await OrdersController.getOrders(req.user.id);
    res.json(result);
  } catch (error: any) {
    console.error('[Orders] GET List Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /:id - Get order details
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params as { id: string };
    const result = await OrdersController.getOrderDetails(req.user.id, id);
    res.json(result);
  } catch (error: any) {
    console.error('[Orders] GET Detail Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { createAuthMiddleware } from '@novarium/shared';
import { env } from '../config/env.js';

const router = Router();
const auth = createAuthMiddleware(env.JWT_SECRET, env.INTERNAL_SERVICE_KEY);

import { RequestHandler } from 'express';

// Routes for customer-service proxy or direct frontend call
// Notice the internal service key bypass is handled by the shared auth middleware
router.get('/customer/:customerId', auth as any, OrderController.getCustomerOrders);
router.get('/customer/:customerId/:orderId', auth as any, OrderController.getCustomerOrderDetails);

// Admin routes
router.get('/admin', auth as any, OrderController.getAdminOrders);
router.get('/admin/:id', auth as any, OrderController.getAdminOrderDetails);

export default router;

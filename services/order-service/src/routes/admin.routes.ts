/**
 * routes/admin.routes.ts
 * SRP: Handle admin order requests.
 */
import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { ShippingController } from '../controllers/shipping.controller.js';
import { createAuthMiddleware } from '@novarium/shared';
import { env } from '../config/env.js';

const router = Router();
const auth = createAuthMiddleware(env.JWT_SECRET, env.INTERNAL_SERVICE_KEY);

// Order Management
router.get('/', auth as any, OrderController.getAdminOrders);
router.get('/:id', auth as any, OrderController.getAdminOrderDetails);
router.patch('/:id', auth as any, OrderController.updateAdminOrderStatus);

// Shipping & Tracking Management
router.get('/shipping/carriers', auth as any, ShippingController.getCarriers);
router.get('/shipping/track/:orderId', auth as any, ShippingController.getTracking);
router.post('/shipping/tracking/create', auth as any, ShippingController.createTracking);
router.post('/shipping/tracking/update', auth as any, ShippingController.addLog);
// Return Management
router.get('/returns/all', auth as any, OrderController.getAdminReturns);
router.patch('/returns/:id', auth as any, OrderController.updateAdminReturnStatus);

export default router;

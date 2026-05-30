import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller.js';
import { createAuthMiddleware } from '@novarium/shared';
import { env } from '../config/env.js';

const router = Router();
const auth = createAuthMiddleware(env.JWT_SECRET, env.INTERNAL_SERVICE_KEY);

// GET /api/storefront/checkout/midtrans/status?orderId=...
router.get('/midtrans/status', CheckoutController.getMidtransStatus);

// POST /api/storefront/checkout/midtrans - Initiate charge
router.post('/midtrans', auth, CheckoutController.initiateCharge);

// POST /api/storefront/checkout/midtrans/notification - Webhook
router.post('/midtrans/notification', CheckoutController.handleWebhook);

export default router;

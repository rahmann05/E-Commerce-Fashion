import { Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { createAuthMiddleware } from '@novarium/shared';
import { env } from '../config/env.js';

const router = Router();
const auth = createAuthMiddleware(env.JWT_SECRET, env.INTERNAL_SERVICE_KEY);

router.use(auth);

router.get('/', CartController.getCart);
router.post('/', CartController.addToCart);
router.put('/', CartController.updateQuantity);
router.delete('/:itemId', CartController.removeItem);
router.patch('/', CartController.clearCart);

export default router;

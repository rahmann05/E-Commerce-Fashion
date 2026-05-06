import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', CartController.getCart);
router.post('/', CartController.addToCart);
router.put('/', CartController.updateQuantity);
router.delete('/:itemId', CartController.removeItem);
router.patch('/', CartController.clearCart);

export default router;

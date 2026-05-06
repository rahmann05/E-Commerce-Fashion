import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await CartController.getCart(req.user!.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const result = await CartController.addToCart(req.user!.id, req.body);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/', async (req: AuthRequest, res) => {
  try {
    const result = await CartController.updateQuantity(req.user!.id, req.body);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:itemId', async (req: AuthRequest, res) => {
  try {
    const result = await CartController.removeItem(req.user!.id, req.params.itemId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/', async (req: AuthRequest, res) => {
  try {
    const result = await CartController.clearCart(req.user!.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

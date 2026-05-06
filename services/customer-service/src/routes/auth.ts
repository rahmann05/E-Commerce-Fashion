import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const result = await AuthController.login(req.body);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const result = await AuthController.register(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/me', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const result = await AuthController.getMe(req.user!.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export default router;

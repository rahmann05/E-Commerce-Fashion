import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await AccountController.getProfile(req.user!.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { action, ...body } = req.body;
    const result = await AccountController.mutateAccount(req.user!.id, action, body);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

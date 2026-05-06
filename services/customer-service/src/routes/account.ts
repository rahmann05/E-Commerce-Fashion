import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', AccountController.getProfile);
router.post('/', AccountController.mutateAccount);

export default router;

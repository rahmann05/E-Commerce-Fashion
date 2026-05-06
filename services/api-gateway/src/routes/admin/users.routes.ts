import { Router } from 'express';
import { adminProxy } from '../../proxies/admin.proxy';
import { authenticateJWT } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { loginSchema } from '@novure/contracts';

const router = Router();

// Admin auth
router.use('/login', validate(loginSchema), adminProxy);
router.use('/logout', adminProxy);
router.use('/me', authenticateJWT, adminProxy);

export default router;

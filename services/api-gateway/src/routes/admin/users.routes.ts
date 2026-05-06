import { Router } from 'express';
import { adminAuthProxy } from '../../proxies/admin.proxy';
import { authenticateJWT } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { loginSchema } from '@novure/contracts';

const router = Router();

// Admin auth
router.use('/login', validate(loginSchema), adminAuthProxy);
router.use('/logout', adminAuthProxy);
router.use('/me', authenticateJWT, adminAuthProxy);

export default router;

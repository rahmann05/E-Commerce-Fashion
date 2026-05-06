import { Router } from 'express';
import { customerProxy } from '../../proxies/admin.proxy';
import { authenticateJWT } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { loginSchema } from '@novure/contracts';

const router = Router();

router.use('/login', validate(loginSchema), customerProxy);
router.use('/register', customerProxy);
router.use('/logout', customerProxy);
router.use('/me', authenticateJWT, customerProxy);

export default router;

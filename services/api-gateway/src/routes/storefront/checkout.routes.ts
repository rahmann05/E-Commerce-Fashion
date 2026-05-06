import { Router } from 'express';
import { customerProxy } from '../../proxies/admin.proxy';
import { authenticateJWT } from '../../middlewares/auth';

const router = Router();

// Checkout & Orders need authentication
router.use('/', authenticateJWT, customerProxy);

export default router;

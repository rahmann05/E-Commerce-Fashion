import { Router } from 'express';
import { adminProxy } from '../../proxies/admin.proxy';
import { authenticateJWT } from '../../middlewares/auth';

const router = Router();

// Admin orders need authentication
router.use('/', authenticateJWT, adminProxy);

export default router;

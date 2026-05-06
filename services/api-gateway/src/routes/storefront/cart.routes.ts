import { Router } from 'express';
import { customerProxy } from '../../proxies/admin.proxy';
import { authenticateJWT } from '../../middlewares/auth';

const router = Router();

// Cart needs authentication
router.use('/', authenticateJWT, customerProxy);

export default router;

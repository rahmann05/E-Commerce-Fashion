import { Router } from 'express';
import { adminProxy } from '../../proxies/admin.proxy';
import { authenticateJWT } from '../../middlewares/auth';

const router = Router();

router.use('/', authenticateJWT, adminProxy);

export default router;

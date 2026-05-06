import { Router } from 'express';
import { adminManagementProxy } from '../../proxies/admin.proxy';
import { authenticateJWT } from '../../middlewares/auth';

const router = Router();

router.use('/', authenticateJWT, adminManagementProxy);

export default router;

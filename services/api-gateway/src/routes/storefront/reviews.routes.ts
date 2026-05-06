import { Router } from 'express';
import { commerceProxy } from '../../proxies/commerce.proxy';
import { authenticateJWT } from '../../middlewares/auth';

const router = Router();

router.post('/', authenticateJWT, commerceProxy);

export default router;

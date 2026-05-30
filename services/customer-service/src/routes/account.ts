import { Router } from 'express';
import { AccountController } from '../controllers/account.controller.js';
import { createAuthMiddleware } from '@novarium/shared';
import { env } from '../config/env.js';

const router = Router();
const auth = createAuthMiddleware(env.JWT_SECRET, env.INTERNAL_SERVICE_KEY);

router.use(auth);

router.get('/', AccountController.getProfile);
router.post('/', AccountController.mutateAccount);

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { createAuthMiddleware } from '@novarium/shared';
import { env } from '../config/env.js';

const router = Router();
const auth = createAuthMiddleware(env.JWT_SECRET, env.INTERNAL_SERVICE_KEY);

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', auth, AuthController.getMe);
router.post('/logout', AuthController.logout);

export default router;

import { Router } from "express";
import { AdminAuthController } from "../controllers/auth.controller.js";
import { createAuthMiddleware } from "@novarium/shared";
import { env } from "../config/env.js";
import cookie from 'cookie';

const router = Router();
const auth = createAuthMiddleware(env.JWT_SECRET, env.INTERNAL_SERVICE_KEY);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AdminAuthController.login({ email, password });
    
    // Set cookie
    res.cookie('novarium_jwt', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ success: true, data: { user: result.user, token: result.token } });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

router.get("/me", auth, async (req: any, res) => {
  try {
    // Middleware `auth` already decoded the user into req.user
    const result = await AdminAuthController.getMe(req.user.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie('novarium_jwt', { path: '/' });
  res.clearCookie('admin_session', { path: '/' });
  res.json({ success: true, data: null });
});

export default router;

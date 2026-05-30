import { Router } from "express";
import { AdminAuthController } from "../controllers/auth.controller";
import { createAuthMiddleware } from "@novarium/shared";
import { env } from "../config/env";

const router = Router();
const auth = createAuthMiddleware(env.JWT_SECRET, env.INTERNAL_SERVICE_KEY);

router.post("/login", AdminAuthController.login);
router.get("/me", auth as any, AdminAuthController.getMe);
router.post("/logout", AdminAuthController.logout);

export default router;

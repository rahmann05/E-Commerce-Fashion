import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { createAuthMiddleware } from "@novarium/shared";
import { env } from "../config/env";

const router = Router();
const auth = createAuthMiddleware(env.JWT_SECRET, env.INTERNAL_SERVICE_KEY);

router.post("/", auth as any, ReviewController.submitReview);

export default router;
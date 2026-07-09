/**
 * routes/product.routes.ts
 * SRP: Storefront-facing product routes only.
 * Admin product routes are handled by product.admin.routes.ts
 */
import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { ReviewController } from "../controllers/review.controller";

const router = Router();

import { createAuthMiddleware } from "@novarium/shared";
const internalAuth = createAuthMiddleware(process.env.INTERNAL_SERVICE_KEY || 'novarium-internal-mesh-key-2026');

router.post("/internal/deduct-stock", internalAuth, ProductController.deductStock);
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProductById);
router.get("/:id/reviews", ReviewController.getReviewsByProductId);

export default router;

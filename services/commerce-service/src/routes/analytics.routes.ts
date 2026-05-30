import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";

const router = Router();

router.get("/", AnalyticsController.getDashboardMetrics as any);

export default router;
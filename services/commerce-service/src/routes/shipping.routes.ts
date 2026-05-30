import { Router } from "express";
import { ShippingController } from "../controllers/shipping.controller";

const router = Router();

router.post("/calculate", ShippingController.calculateShipping as any);

export default router;
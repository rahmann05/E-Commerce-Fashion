import { Router } from "express";
import { AdminShippingController } from "../controllers/shipping.controller";

const router = Router();

router.get("/carriers", async (req, res) => {
  try {
    const result = await AdminShippingController.getCarriers();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/tracking/:number", async (req, res) => {
  try {
    const result = await AdminShippingController.getTracking(req.params.number);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/tracking/create", async (req, res) => {
  try {
    const { orderId, carrierId, trackingNumber, estimatedArrival } = req.body;
    const result = await AdminShippingController.createTracking({
      orderId,
      carrierId,
      trackingNumber,
      estimatedArrival
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/tracking/update", async (req, res) => {
  try {
    const { trackingNumber, status, location, description } = req.body;
    const result = await AdminShippingController.updateTracking({
      trackingNumber,
      status,
      location,
      description
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

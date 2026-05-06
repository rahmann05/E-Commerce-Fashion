import { Router } from 'express';
import { ShippingController } from '../controllers/shipping.controller';

const router = Router();

router.get('/track/:orderId', async (req, res) => {
  try {
    const result = await ShippingController.getTrackingByOrderId(req.params.orderId);
    return res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('SHIPPING_TRACK_GET_ERROR', error.message);
    const status = error.message === "Tracking not found" ? 404 : 500;
    return res.status(status).json({ success: false, error: error.message });
  }
});

export default router;

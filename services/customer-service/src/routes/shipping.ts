import { Router } from 'express';
import { prisma } from '../infrastructure/prisma';

const router = Router();

router.get('/track/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const tracking = await prisma.shippingTracking.findUnique({
      where: { orderId },
      include: {
        carrier: { select: { name: true, code: true } },
        logs: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!tracking) {
      return res.status(404).json({ success: false, error: "Tracking not found" });
    }

    return res.json({ success: true, data: tracking });
  } catch (error) {
    console.error('SHIPPING_TRACK_GET_ERROR', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

export default router;

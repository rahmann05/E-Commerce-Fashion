import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/storefront/checkout/midtrans/status?orderId=...
router.get('/midtrans/status', async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ success: false, error: 'Order ID required' });

    const result = await CheckoutController.getMidtransStatus(orderId as string);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Midtrans] Status Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch payment status' });
  }
});

// POST /api/storefront/checkout/midtrans - Initiate charge
router.post('/midtrans', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const result = await CheckoutController.initiateCharge(req.user!.id, req.body);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Midtrans] Charge Error:', error.message);
    
    if (error.message.includes('402')) {
        return res.status(402).json({ 
            success: false, 
            error: 'Metode pembayaran ini belum diaktifkan di Dashboard Midtrans.' 
        });
    }
    
    res.status(500).json({ success: false, error: error.message || 'Failed to initiate payment' });
  }
});

// POST /api/storefront/checkout/midtrans/notification - Webhook
router.post('/midtrans/notification', async (req, res) => {
  try {
    const result = await CheckoutController.handleWebhook(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('[Midtrans] Webhook Error:', error.message);
    res.status(500).json({ success: false });
  }
});

export default router;

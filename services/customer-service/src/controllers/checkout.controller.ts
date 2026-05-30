import { Request, Response, NextFunction } from 'express';
import { CheckoutService } from '../services/checkout.service';
import { AuthRequest } from '../middleware/auth';

export class CheckoutController {
  static async getMidtransStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.query;
      if (!orderId) {
        return res.status(400).json({ success: false, error: 'Order ID required' });
      }
      try {
        const result = await CheckoutService.getMidtransStatus(orderId as string);
        res.json({ success: true, data: result });
      } catch (err: any) {
        if (err.message && (err.message.includes('404') || err.message.toLowerCase().includes('not found') || err.statusCode === 404)) {
          return res.json({ success: false, notFound: true, error: 'Transaction not found in Midtrans' });
        }
        throw err;
      }
    } catch (err) {
      next(err);
    }
  }

  static async initiateCharge(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await CheckoutService.initiateCharge(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (err: any) {
      if (err.message.includes('402')) {
        return res.status(402).json({ 
          success: false, 
          error: 'Metode pembayaran ini belum diaktifkan di Dashboard Midtrans.' 
        });
      }
      next(err);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CheckoutService.handleWebhook(req.body);
      res.json(result);
    } catch (err) {
      console.error('[Midtrans Webhook Error]:', err);
      res.status(500).json({ success: false });
    }
  }
}

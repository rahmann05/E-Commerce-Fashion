import { Request, Response, NextFunction } from 'express';
import { ShippingService } from '../services/shipping.service';

export class ShippingController {
  static async calculateShipping(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: ShippingService.calculateShipping(req.body as any) }); } catch(e) { next(e); }
  }
}

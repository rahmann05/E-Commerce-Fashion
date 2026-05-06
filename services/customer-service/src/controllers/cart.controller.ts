import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { AuthRequest } from '../middleware/auth';

export class CartController {
  static async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await CartService.getCart(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async addToCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await CartService.addItem(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async updateQuantity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await CartService.updateQuantity(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await CartService.removeItem(req.user!.id, req.params.itemId as string);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await CartService.clearCart(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

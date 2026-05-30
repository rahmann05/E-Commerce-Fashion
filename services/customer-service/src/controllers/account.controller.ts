import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/account.service';
import { AuthRequest } from '../middleware/auth';

export class AccountController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await AccountService.getProfile(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async mutateAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { action, ...body } = req.body;
      let result;
      
      if (action === 'addAddress') {
        result = await AccountService.addAddress(req.user!.id, body);
      } else if (action === 'updateAddress') {
        result = await AccountService.updateAddress(req.user!.id, body.id, body);
      } else if (action === 'removeAddress') {
        result = await AccountService.removeAddress(req.user!.id, body.id);
      } else if (action === 'addPaymentMethod') {
        result = await AccountService.addPaymentMethod(req.user!.id, body);
      } else if (action === 'removePaymentMethod') {
        result = await AccountService.removePaymentMethod(req.user!.id, body.id);
      } else if (action === 'createOrder') {
        result = await AccountService.createOrder(req.user!.id, body);
      } else {
        throw new Error(`Action ${action} not supported`);
      }
      
      const updatedProfile = await AccountService.getProfile(req.user!.id);
      res.json({ success: true, data: updatedProfile });
    } catch (err) {
      next(err);
    }
  }
}

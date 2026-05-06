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
      } else {
        // Fallback to old mutateAccount logic for other actions if not yet extracted
        // But for this refactor we assume we extracted the main ones
        throw new Error(`Action ${action} not supported in new controller yet`);
      }
      
      const updatedProfile = await AccountService.getProfile(req.user!.id);
      res.json({ success: true, data: updatedProfile });
    } catch (err) {
      next(err);
    }
  }
}

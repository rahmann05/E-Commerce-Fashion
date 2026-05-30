import { Request, Response, NextFunction } from 'express';
import { AdminAuthService } from '../services/auth.service';

export class AdminAuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AdminAuthService.login({ email, password });
      
      // Set cookie
      res.cookie('novarium_jwt', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ success: true, data: { user: result.user, token: result.token } });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  }

  static async getMe(req: any, res: Response, next: NextFunction) {
    try {
      const result = await AdminAuthService.getMe(req.user.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    res.clearCookie('novarium_jwt', { path: '/' });
    res.clearCookie('admin_session', { path: '/' });
    res.json({ success: true, data: null });
  }
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { AuthUser } from '../types/index.js';

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function createAuthMiddleware(jwtSecret: string, internalKey?: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Cek internal service key (service-to-service auth bypass)
    const reqInternalKey = req.headers['x-internal-key'];
    if (internalKey && reqInternalKey === internalKey) {
      return next();
    }

    // 2. Cari token dari Bearer header atau cookie
    let token: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token && req.headers.cookie) {
      const cookies = cookie.parse(req.headers.cookie);
      token = cookies.novarium_jwt || null;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Token tidak ditemukan' });
    }

    // 3. Verifikasi JWT
    jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Token tidak valid' });
      }
      req.user = decoded as AuthUser;
      next();
    });
  };
}

export function generateToken(id: string, role: string, jwtSecret: string, expiresIn: string = '7d'): string {
  return jwt.sign({ id, role }, jwtSecret, { expiresIn: expiresIn as any });
}

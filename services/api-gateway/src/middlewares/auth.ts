import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Check Cookie
  if (!token && req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    if (cookies.novure_jwt) {
      token = cookies.novure_jwt;
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[Gateway] JWT_SECRET is not defined');
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
    
    // Attach decoded payload to request
    (req as any).user = decoded;
    
    // Also set x-user-id header for downstream services
    if (decoded && decoded.id) {
      req.headers['x-user-id'] = decoded.id;
    }
    if (decoded && decoded.role) {
      req.headers['x-user-role'] = decoded.role;
    }
    
    next();
  });
}

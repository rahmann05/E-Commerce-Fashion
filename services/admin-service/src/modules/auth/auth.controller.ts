import { prisma } from '@infrastructure/database/prisma';
import { verifyPassword } from '@application/auth/password';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'novure-super-secret-key-2026';

export class AdminAuthController {
  static async login(params: { email: string, password: any }) {
    const { email, password } = params;

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !(await verifyPassword(password, admin.password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    return {
      token,
      user: { id: admin.id, email: admin.email, role: admin.role }
    };
  }

  static async getMe(token: string) {
    if (!token) throw new Error('Unauthorized');

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      const admin = await prisma.adminUser.findUnique({ where: { id: decoded.id } });

      if (!admin) throw new Error('Unauthorized');

      return { id: admin.id, email: admin.email, role: admin.role, name: admin.name };
    } catch (err) {
      throw new Error('Invalid token');
    }
  }

  static async logout(cookies: any) {
    cookies.delete('novure_jwt', { path: '/' });
    cookies.delete('admin_session', { path: '/' });
    return { success: true };
  }
}

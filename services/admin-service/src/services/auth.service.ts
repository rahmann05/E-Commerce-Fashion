import { prisma } from '../db/client';
import { verifyPassword, generateToken } from '@novarium/shared';
import { env } from '../config/env';

export class AdminAuthService {
  static async login(params: { email: string, password: any }) {
    const { email, password } = params;

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !(await verifyPassword(password, admin.password))) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(admin.id, admin.role, env.JWT_SECRET, '7d');

    return {
      token,
      user: { id: admin.id, email: admin.email, role: admin.role }
    };
  }

  static async getMe(adminId: string) {
    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) throw new Error('Admin not found');
    return { id: admin.id, email: admin.email, role: admin.role, name: admin.name };
  }
}

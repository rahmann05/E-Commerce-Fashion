import { prisma } from '../db/client.js';
import { generateToken, verifyPassword, hashPassword } from '@novarium/shared';
import { env } from '../config/env.js';

export class AuthService {
  static async login(email: string, password: any) {
    const customer = await prisma.customer.findUnique({ where: { email } });
    
    if (!customer) {
      const error = new Error('Pengguna tidak terdaftar') as any;
      error.status = 404;
      throw error;
    }
    
    if (!(await verifyPassword(password, customer.password))) {
      const error = new Error('Email atau password salah') as any;
      error.status = 401;
      throw error;
    }
    
    const token = generateToken(customer.id, 'CUSTOMER', env.JWT_SECRET, '7d');
    const { password: _, ...customerData } = customer;
    return { user: customerData, token };
  }

  static async register(data: { email: string, password: any, name: string, phone: string }) {
    const { email, password, name, phone } = data;
    const existing = await prisma.customer.findUnique({ where: { email } });
    
    if (existing) {
      const error = new Error('Email sudah terdaftar') as any;
      error.status = 400;
      throw error;
    }
    
    const hashedPassword = await hashPassword(password);
    const customer = await prisma.customer.create({
      data: { email, password: hashedPassword, name, phone }
    });
    
    const token = generateToken(customer.id, 'CUSTOMER', env.JWT_SECRET, '7d');
    const { password: _, ...customerData } = customer;
    return { user: customerData, token };
  }

  static async getMe(id: string) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new Error('Pelanggan tidak ditemukan');
    const { password: _, ...customerData } = customer;
    return { user: customerData };
  }
}

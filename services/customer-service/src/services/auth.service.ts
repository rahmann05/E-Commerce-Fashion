import { prisma } from '../db/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth';

export class AuthService {
  static async login(email: string, password: any) {
    const customer = await prisma.customer.findUnique({ where: { email } });
    
    if (!customer || !bcrypt.compareSync(password, customer.password)) {
      const error = new Error('Email atau password salah') as any;
      error.status = 401;
      throw error;
    }
    
    const token = generateToken(customer.id, 'CUSTOMER');
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
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const customer = await prisma.customer.create({
      data: { email, password: hashedPassword, name, phone }
    });
    
    const token = generateToken(customer.id, 'CUSTOMER');
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

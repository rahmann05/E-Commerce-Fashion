import bcrypt from 'bcryptjs';
import { prisma } from '../db/client';
import { generateToken } from '../middleware/auth';

export class AuthController {
  static async login(params: { email: string, password: any }) {
    const { email, password } = params;
    const customer = await prisma.customer.findUnique({ where: { email } });
    
    if (!customer || !bcrypt.compareSync(password, customer.password)) {
      throw new Error('Invalid credentials');
    }
    
    const token = generateToken(customer.id, 'CUSTOMER');
    const { password: _, ...customerData } = customer;
    return { data: customerData, token };
  }

  static async register(params: { email: string, password: any, name: string, phone: string }) {
    const { email, password, name, phone } = params;
    const existing = await prisma.customer.findUnique({ where: { email } });
    
    if (existing) throw new Error('Email exists');
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const customer = await prisma.customer.create({
      data: { email, password: hashedPassword, name, phone }
    });
    
    const token = generateToken(customer.id, 'CUSTOMER');
    const { password: _, ...customerData } = customer;
    return { data: customerData, token };
  }

  static async getMe(userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: userId } });
    if (!customer) throw new Error('Not found');
    
    const { password: _, ...customerData } = customer;
    return { data: customerData };
  }
}

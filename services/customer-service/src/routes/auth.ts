import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../infrastructure/prisma';
import { generateToken, authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: any, res: any) => {
  const { email, password } = req.body;
  const customer = await prisma.customer.findUnique({ where: { email } });
  
  if (!customer || !bcrypt.compareSync(password, customer.password)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  const token = generateToken(customer.id, 'CUSTOMER');
  const { password: _, ...customerData } = customer;
  res.json({ success: true, data: customerData, token });
});

router.post('/register', async (req: any, res: any) => {
  const { email, password, name, phone } = req.body;
  const existing = await prisma.customer.findUnique({ where: { email } });
  
  if (existing) return res.status(400).json({ success: false, message: 'Email exists' });
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  const customer = await prisma.customer.create({
    data: { email, password: hashedPassword, name, phone }
  });
  
  const token = generateToken(customer.id, 'CUSTOMER');
  const { password: _, ...customerData } = customer;
  res.status(201).json({ success: true, data: customerData, token });
});

router.get('/me', authenticateJWT, async (req: AuthRequest, res: any) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.user!.id } });
  if (!customer) return res.status(404).json({ success: false, message: 'Not found' });
  
  const { password: _, ...customerData } = customer;
  res.json({ success: true, data: customerData });
});

export default router;

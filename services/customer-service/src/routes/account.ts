import { Router } from 'express';
import { prisma } from '../infrastructure/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', async (req: AuthRequest, res) => {
  const customerId = req.user!.id;
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { addresses: true, paymentMethods: true }
  });

  if (!customer) return res.status(404).json({ success: false });

  const orders = await prisma.order.findMany({
    where: { customerId },
    include: { items: true }
  });

  res.json({
    success: true,
    data: {
      phone: customer.phone,
      addresses: customer.addresses,
      paymentMethods: customer.paymentMethods,
      orders,
      wishlist: [], vouchers: [], notifications: []
    }
  });
});

router.post('/', async (req: AuthRequest, res) => {
  const customerId = req.user!.id;
  const { action, ...body } = req.body;

  if (action === 'addAddress') {
    await prisma.address.create({ data: { ...body, isPrimary: false, customerId } });
  } else if (action === 'addPaymentMethod') {
    await prisma.savedPaymentMethod.create({ data: { ...body, isPrimary: false, customerId } });
  }

  // Refetch
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { addresses: true, paymentMethods: true }
  });
  
  res.json({
    success: true,
    data: {
      phone: customer?.phone,
      addresses: customer?.addresses,
      paymentMethods: customer?.paymentMethods,
      orders: [], wishlist: [], vouchers: [], notifications: []
    }
  });
});

export default router;

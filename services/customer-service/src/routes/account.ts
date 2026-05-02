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
  
  console.log(`[Account] Mutation triggered: ${action} for customer ${customerId}`);
  console.log('[Account] Body payload:', JSON.stringify(body));

  try {
    if (action === 'addAddress') {
      await prisma.address.create({ 
        data: { 
          line1: body.line1 || body.address || '',
          city: body.city || '',
          province: body.province || '',
          isPrimary: false, 
          customerId 
        } 
      });
      console.log('[Account] Address created successfully');
    } else if (action === 'addPaymentMethod') {
      // Mapping the frontend fields to the Prisma SavedPaymentMethod model
      await prisma.savedPaymentMethod.create({ 
        data: { 
          provider: body.provider || body.label || 'Unknown',
          cardMask: body.cardMask || body.accountNumber?.slice(-4) || '****',
          token: body.token || body.accountNumber || 'dummy-token',
          isPrimary: false, 
          customerId 
        } 
      });
      console.log('[Account] Payment method created successfully');
    } else if (action === 'createOrder') {
      const { items, total, addressId } = body;
      
      const order = await prisma.order.create({
        data: {
          customerId,
          totalAmount: total,
          status: 'AWAITING_PAYMENT',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productVariantId: item.productVariantId || item.variantId,
              quantity: item.quantity,
              price: item.product?.price || 0,
              size: item.variant?.size || item.size
            }))
          }
        }
      });
      console.log(`[Account] Order created: ${order.id}`);
      
      // Return consistent structure for ProfileDataContext
      return res.json({
        success: true,
        data: {
          orders: [{ id: order.id }]
        }
      });
    } else {
      console.warn(`[Account] Unknown action: ${action}`);
    }
  } catch (err: any) {
    console.error('[Account] Error during mutation:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }

  // Refetch updated data
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { addresses: true, paymentMethods: true }
    });
    
    res.json({
      success: true,
      data: {
        phone: customer?.phone || '',
        addresses: customer?.addresses || [],
        paymentMethods: customer?.paymentMethods || [],
        orders: [], wishlist: [], vouchers: [], notifications: []
      }
    });
  } catch (err: any) {
    console.error('[Account] Error refetching after mutation:', err.message);
    res.status(500).json({ success: false, error: 'Saved but failed to refetch' });
  }
});

export default router;

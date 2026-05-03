import { Router } from 'express';
import { prisma } from '../infrastructure/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// Internal URL for Commerce Service to fetch product data directly
const COMMERCE_SERVICE_URL = process.env.COMMERCE_SERVICE_URL || 'http://commerce-service:3001';

async function fetchProduct(productId: string) {
  try {
    const res = await fetch(`${COMMERCE_SERVICE_URL}/api/products/${productId}`);
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.data;
  } catch (err) {
    console.error(`Error fetching product ${productId}:`, err);
    return null;
  }
}

router.get('/', async (req: AuthRequest, res) => {
  const customerId = req.user!.id;
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { addresses: true, paymentMethods: true }
  });

  if (!customer) return res.status(404).json({ success: false });

  const orders = await prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });

  // Map and Hydrate orders for frontend consistency
  const mappedOrders = await Promise.all(orders.map(async (o) => {
    const primaryItem = o.items[0];
    let hydratedItem: any = primaryItem ? { ...primaryItem } : null;
    
    if (primaryItem) {
        const product = await fetchProduct(primaryItem.productId);
        if (product) {
          hydratedItem.name = product.name;
          hydratedItem.imageUrl = product.imageUrl || (product.image && product.image[0]) || (product.images && product.images[0]) || '/images/about/model1.png';
        } else {
          hydratedItem.name = 'Pesanan';
          hydratedItem.imageUrl = '/images/about/model1.png';
        }
        hydratedItem.unitPrice = Number(primaryItem.price);
    }

    return {
      ...o,
      total: Number(o.totalAmount),
      items: hydratedItem ? [hydratedItem, ...o.items.slice(1)] : []
    };
  }));

  res.json({
    success: true,
    data: {
      phone: customer.phone,
      addresses: customer.addresses,
      paymentMethods: customer.paymentMethods.map(pm => ({
        ...pm,
        label: pm.provider // Map provider to label for frontend
      })),
      orders: mappedOrders,
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
          accountNumber: body.accountNumber || '',
          accountName: body.accountName || '',
          isPrimary: false, 
          customerId 
        } 
      });
      console.log('[Account] Payment method created successfully');
    } else if (action === 'createOrder') {
      const { items, total, addressId, shipping } = body;
      
      const order = await prisma.order.create({
        data: {
          customerId,
          addressId,
          totalAmount: total,
          shippingAmount: shipping || 0,
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
      
      // We will let the code proceed to refetch and return full data
      // but we'll manually inject the new order to the orders list below
      req.params.newOrderId = order.id; 
    } else if (action === 'removeAddress') {
      await prisma.address.delete({
        where: { id: body.id, customerId }
      });
      console.log(`[Account] Address deleted: ${body.id}`);
    } else if (action === 'removePaymentMethod') {
      await prisma.savedPaymentMethod.delete({
        where: { id: body.id, customerId }
      });
      console.log(`[Account] Payment method deleted: ${body.id}`);
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

    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    // Hydrate orders (similar to GET /)
    const mappedOrders = await Promise.all(orders.map(async (o) => {
      const primaryItem = o.items[0];
      let hydratedItem: any = primaryItem ? { ...primaryItem } : null;
      if (primaryItem) {
          const product = await fetchProduct(primaryItem.productId);
          if (product) {
            hydratedItem.name = product.name;
            hydratedItem.imageUrl = product.imageUrl || (product.image && product.image[0]) || (product.images && product.images[0]) || '/images/about/model1.png';
          } else {
            hydratedItem.name = 'Pesanan';
            hydratedItem.imageUrl = '/images/about/model1.png';
          }
          hydratedItem.unitPrice = Number(primaryItem.price);
      }
      return {
        ...o,
        total: Number(o.totalAmount),
        items: hydratedItem ? [hydratedItem, ...o.items.slice(1)] : []
      };
    }));
    
    res.json({
      success: true,
      data: {
        phone: customer?.phone || '',
        addresses: customer?.addresses || [],
        paymentMethods: customer?.paymentMethods.map(pm => ({ ...pm, label: pm.provider })) || [],
        orders: mappedOrders,
        wishlist: [], vouchers: [], notifications: []
      }
    });
  } catch (err: any) {
    console.error('[Account] Error refetching after mutation:', err.message);
    res.status(500).json({ success: false, error: 'Saved but failed to refetch' });
  }
});

export default router;

import { prisma } from '../db/client';

const GATEWAY_URL = process.env.INTERNAL_API_URL || 'http://api-gateway:8000/api/storefront';
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY;

async function fetchProduct(productId: string) {
  try {
    const res = await fetch(`${GATEWAY_URL}/products/${productId}`, {
      headers: {
        'x-internal-key': INTERNAL_KEY || ''
      }
    });
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.data;
  } catch (err) {
    console.error(`Error fetching product ${productId} via Gateway:`, err);
    return null;
  }
}

export class AccountController {
  static async getProfile(userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: userId },
      include: { addresses: true, paymentMethods: true }
    });

    if (!customer) throw new Error('Customer not found');

    const orders = await prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    // Map and Hydrate orders
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

    return {
      data: {
        phone: customer.phone,
        addresses: customer.addresses,
        paymentMethods: customer.paymentMethods.map(pm => ({
          ...pm,
          label: pm.provider
        })),
        orders: mappedOrders,
        wishlist: [], vouchers: [], notifications: []
      }
    };
  }

  static async mutateAccount(userId: string, action: string, body: any) {
    if (action === 'addAddress') {
      await prisma.address.create({ 
        data: { 
          line1: body.line1 || body.address || '',
          city: body.city || '',
          province: body.province || '',
          isPrimary: false, 
          customerId: userId 
        } 
      });
    } else if (action === 'addPaymentMethod') {
      await prisma.savedPaymentMethod.create({ 
        data: { 
          provider: body.provider || body.label || 'Unknown',
          cardMask: body.cardMask || body.accountNumber?.slice(-4) || '****',
          token: body.token || body.accountNumber || 'dummy-token',
          accountNumber: body.accountNumber || '',
          accountName: body.accountName || '',
          isPrimary: false, 
          customerId: userId 
        } 
      });
    } else if (action === 'createOrder') {
      const { items, total, addressId, shipping } = body;
      
      await prisma.order.create({
        data: {
          customerId: userId,
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
    } else if (action === 'removeAddress') {
      await prisma.address.delete({
        where: { id: body.id, customerId: userId }
      });
    } else if (action === 'removePaymentMethod') {
      await prisma.savedPaymentMethod.delete({
        where: { id: body.id, customerId: userId }
      });
    }

    return await this.getProfile(userId);
  }
}

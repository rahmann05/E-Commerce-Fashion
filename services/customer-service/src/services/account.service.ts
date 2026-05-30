import { prisma } from '../db/client';

const GATEWAY_URL = process.env.INTERNAL_API_URL || 'http://api-gateway:8000/api/storefront';
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY;

export class AccountService {
  private static async fetchProducts(productIds: string[]) {
    if (productIds.length === 0) return [];
    try {
      const idsParam = productIds.join(',');
      const res = await fetch(`${GATEWAY_URL}/products?ids=${idsParam}`, {
        headers: { 'x-internal-key': INTERNAL_KEY || '' }
      });
      if (!res.ok) return [];
      const json = await res.json() as any;
      return json.data || [];
    } catch (err) {
      console.error(`[AccountService] Error fetching products:`, err);
      return [];
    }
  }

  static async getProfile(userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: userId },
      include: { addresses: true, paymentMethods: true }
    });

    if (!customer) throw new Error('Pelanggan tidak ditemukan');

    const orders = await prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    const productIds = Array.from(new Set(orders.flatMap(o => o.items.map(i => i.productId))));
    const products = await this.fetchProducts(productIds);

    const mappedOrders = orders.map((o) => {
      const hydratedItems = o.items.map(item => {
        const product = products.find((p: any) => p.id === item.productId);
        return {
          ...item,
          name: product?.name || 'Pesanan',
          imageUrl: product?.imageUrl || (product?.image && product.image[0]) || (product?.images && product.images[0]) || '/images/about/model1.png',
          unitPrice: Number(item.price)
        };
      });

      return {
        ...o,
        total: Number(o.totalAmount),
        items: hydratedItems
      };
    });

    return {
      phone: customer.phone,
      addresses: customer.addresses,
      paymentMethods: customer.paymentMethods.map(pm => ({
        ...pm,
        label: pm.provider
      })),
      orders: mappedOrders,
      wishlist: [], vouchers: [], notifications: []
    };
  }

  static async addAddress(userId: string, data: any) {
    return await prisma.address.create({ 
      data: { 
        label: data.label || "Rumah",
        recipient: data.recipient || "",
        phone: data.phone || "",
        line1: data.line1 || data.address || "",
        district: data.district || "",
        city: data.city || "",
        province: data.province || "",
        postalCode: data.postalCode || "",
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        isPrimary: data.isPrimary || false, 
        customerId: userId 
      } 
    });
  }

  static async updateAddress(userId: string, addressId: string, data: any) {
    // If setting as primary, unset others first
    if (data.isPrimary) {
      await prisma.address.updateMany({
        where: { customerId: userId },
        data: { isPrimary: false }
      });
    }

    return await prisma.address.update({
      where: { id: addressId, customerId: userId },
      data: {
        label: data.label,
        recipient: data.recipient,
        phone: data.phone,
        line1: data.line1 || data.address,
        district: data.district,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        isPrimary: data.isPrimary
      }
    });
  }

  static async removeAddress(userId: string, addressId: string) {
    return await prisma.address.delete({
      where: { id: addressId, customerId: userId }
    });
  }

  static async addPaymentMethod(userId: string, data: any) {
    return await prisma.savedPaymentMethod.create({
      data: {
        provider: data.provider || data.label || 'Unknown',
        cardMask: data.cardMask || data.accountNumber?.slice(-4) || '****',
        token: data.token || data.accountNumber || 'dummy-token',
        accountNumber: data.accountNumber || '',
        accountName: data.accountName || '',
        isPrimary: data.isPrimary || false,
        customerId: userId
      }
    });
  }

  static async removePaymentMethod(userId: string, paymentMethodId: string) {
    return await prisma.savedPaymentMethod.delete({
      where: { id: paymentMethodId, customerId: userId }
    });
  }

  static async createOrder(userId: string, data: any) {
    const { items, total, addressId, shipping } = data;
    
    const address = await prisma.address.findUnique({
      where: { id: addressId, customerId: userId }
    });
    
    const addressSnapshot = address ? JSON.stringify(address) : null;

    return await prisma.order.create({
      data: {
        customerId: userId,
        addressSnapshot,
        totalAmount: total,
        shippingAmount: shipping || 0,
        status: 'AWAITING_PAYMENT',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productVariantId: item.productVariantId || item.variantId,
            quantity: item.quantity,
            price: item.product?.price || item.price || 0,
            size: item.variant?.size || item.size || 'M'
          }))
        }
      }
    });
  }
}

import { prisma } from '../db/client.js';

import { createServiceClient } from '@novarium/shared';
import { env } from '../config/env.js';

const commerceClient = createServiceClient(env.COMMERCE_SERVICE_URL, env.INTERNAL_SERVICE_KEY);

export class AccountService {
  private static async fetchProducts(productIds: string[]) {
    if (productIds.length === 0) return [];
    try {
      const idsParam = productIds.join(',');
      const json = await commerceClient.get(`/api/commerce/products?ids=${idsParam}`) as { success: boolean, data: any[] };
      return json.data || [];
    } catch (err: any) {
      console.error(`[AccountService] Error fetching products:`, err.message);
      return [];
    }
  }

  static async getProfile(userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: userId },
      include: { addresses: true, paymentMethods: true }
    });

    if (!customer) throw new Error('Pelanggan tidak ditemukan');

    let orders = await prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    // Auto-sync AWAITING_PAYMENT orders with Midtrans
    const awaitingOrders = orders.filter((o) => o.status === 'AWAITING_PAYMENT');
    if (awaitingOrders.length > 0) {
      const { CheckoutService } = require('./checkout.service');
      let dbUpdated = false;
      await Promise.all(
        awaitingOrders.map(async (order) => {
          // 1. Auto-expire if order is older than 24 hours locally
          const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
          const ONE_DAY_MS = 24 * 60 * 60 * 1000;
          if (orderAgeMs > ONE_DAY_MS) {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'CANCELLED' }
            });
            dbUpdated = true;
            return; // Skip Midtrans check
          }

          // 2. Check Midtrans status for newer orders
          try {
            const statusResponse = await CheckoutService.getMidtransStatus(order.id);
            if (statusResponse && statusResponse.transaction_status) {
               const { transaction_status } = statusResponse;
               if (['settlement', 'capture', 'expire', 'cancel', 'deny'].includes(transaction_status)) {
                  dbUpdated = true;
               }
            }
          } catch (e) {
            // Ignore if transaction doesn't exist in Midtrans yet
          }
        })
      );
      
      if (dbUpdated) {
        orders = await prisma.order.findMany({
          where: { customerId: userId },
          orderBy: { createdAt: 'desc' },
          include: { items: true }
        });
      }
    }

    const productIds = Array.from(new Set(orders.flatMap(o => o.items.map(i => i.productId))));
    const products = await this.fetchProducts(productIds);

    const mappedOrders = orders.map((o) => {
      const hydratedItems = o.items.map(item => {
        const product = products.find((p: any) => p.id === item.productId);
        let color = '';
        if (product?.variants) {
          const variant = product.variants.find((v: any) => v.id === item.productVariantId);
          if (variant?.color) color = variant.color;
        }
        if (!color && product?.colors && product.colors.length > 0) {
          color = product.colors[0];
        }
        return {
          ...item,
          name: product?.name || 'Pesanan',
          color,
          imageUrl: product?.imageUrl || (product?.image && product.image[0]) || (product?.images && product.images[0]) || '/images/about/model1.png',
          unitPrice: Number(item.price)
        };
      });

      let address = undefined;
      if (o.addressSnapshot) {
        try {
          address = typeof o.addressSnapshot === 'string' ? JSON.parse(o.addressSnapshot) : o.addressSnapshot;
        } catch (e) {
          console.error("Failed to parse addressSnapshot", e);
        }
      }

      return {
        ...o,
        address,
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

    const order = await prisma.order.create({
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

    // Clear cart items that were purchased
    if (items && items.length > 0) {
      const cart = await prisma.cart.findUnique({ where: { customerId: userId } });
      if (cart) {
        const variantIds = items.map((i: any) => i.productVariantId || i.variantId).filter(Boolean);
        if (variantIds.length > 0) {
           await prisma.cartItem.deleteMany({
             where: {
               cartId: cart.id,
               productVariantId: { in: variantIds }
             }
           });
        } else {
           // Fallback if variantIds are missing, just clear the whole cart
           await prisma.cartItem.deleteMany({
             where: { cartId: cart.id }
           });
        }
      }
    }

    return order;
  }
}

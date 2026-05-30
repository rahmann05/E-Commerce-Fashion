import { prisma } from '../db/client.js';
import { createServiceClient } from '@novarium/shared';
import { env } from '../config/env.js';

const commerceClient = createServiceClient(env.COMMERCE_SERVICE_URL, env.INTERNAL_SERVICE_KEY);

export class CartService {
  private static async fetchProducts(productIds: string[]) {
    if (productIds.length === 0) return [];
    try {
      const idsParam = productIds.join(',');
      const json = await commerceClient.get(`/api/commerce/products?ids=${idsParam}`) as { success: boolean, data: any[] };
      const data = json.data || [];
      return data.map((d: any) => ({
        ...d,
        price: Number(d.price)
      }));
    } catch (err: any) {
      console.error(`[CartService] Error fetching products via direct call:`, err.message);
      return [];
    }
  }

  private static async hydrateItems(items: any[]) {
    if (items.length === 0) return [];
    const productIds = Array.from(new Set(items.map(item => item.productId as string)));
    const products = await this.fetchProducts(productIds);
    
    return items.map(item => {
      const product = products.find((p: any) => p.id === item.productId);
      const variant = (product as any)?.variants?.find((v: any) => v.id === item.productVariantId);
      return {
        ...item,
        product: product || null,
        variant
      };
    });
  }

  static async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { customerId: userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId: userId },
        include: { items: true },
      });
    }

    const hydratedItems = await this.hydrateItems(cart.items);
    return { ...cart, items: hydratedItems };
  }

  static async addItem(userId: string, body: { productId: string, productVariantId: string, quantity?: number }) {
    const { productId, productVariantId, quantity = 1 } = body;

    let cart = await prisma.cart.findUnique({ where: { customerId: userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { customerId: userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          productVariantId,
          quantity,
        },
      });
    }

    return await this.getCart(userId);
  }

  static async updateQuantity(userId: string, body: { itemId: string, quantity: number }) {
    const { itemId, quantity } = body;

    const cart = await prisma.cart.findUnique({ where: { customerId: userId } });
    if (!cart) throw new Error('Cart not found');

    await prisma.cartItem.update({
      where: { id: itemId, cartId: cart.id },
      data: { quantity: Math.max(1, quantity) }
    });

    return await this.getCart(userId);
  }

  static async removeItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { customerId: userId } });
    if (!cart) throw new Error('Cart not found');

    await prisma.cartItem.delete({
      where: { id: itemId, cartId: cart.id },
    });

    return await this.getCart(userId);
  }

  static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { customerId: userId } });
    if (!cart) throw new Error('Cart not found');

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { ...cart, items: [] };
  }
}

import { prisma } from '../db/client';

const GATEWAY_URL = process.env.INTERNAL_API_URL || 'http://api-gateway:8000/api/storefront';
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY;

async function fetchProducts(productIds: string[]) {
  if (productIds.length === 0) return [];
  try {
    const idsParam = productIds.join(',');
    const res = await fetch(`${GATEWAY_URL}/products?ids=${idsParam}`, {
      headers: {
        'x-internal-key': INTERNAL_KEY || ''
      }
    });
    if (!res.ok) {
      console.error(`[Cart] fetchProducts failed: ${res.status}`);
      return [];
    }
    const json = await res.json() as any;
    const data = json.data || [];
    return data.map((d: any) => ({
      ...d,
      price: Number(d.price)
    }));
  } catch (err: any) {
    console.error(`[Cart] Error fetching products via Gateway:`, err.message);
    return [];
  }
}

async function hydrateCartItems(items: any[]) {
  if (items.length === 0) return [];
  const productIds = Array.from(new Set(items.map(item => item.productId as string)));
  const products = await fetchProducts(productIds);
  
  return items.map(item => {
    const product = products.find((p: any) => p.id === item.productId);
    const variant = product?.variants?.find((v: any) => v.id === item.productVariantId);
    return {
      ...item,
      product: product || null,
      variant
    };
  });
}

export class CartController {
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

    const hydratedItems = await hydrateCartItems(cart.items);
    return { data: { ...cart, items: hydratedItems } };
  }

  static async addToCart(userId: string, body: { productId: string, productVariantId: string, quantity?: number }) {
    const { productId, productVariantId, quantity } = body;

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
        data: { quantity: existingItem.quantity + (quantity || 1) },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          productVariantId,
          quantity: quantity || 1,
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
    return { data: { ...cart, items: [] } };
  }
}

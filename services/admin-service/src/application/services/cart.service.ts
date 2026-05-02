import { prisma } from '@infrastructure/database/prisma';

// Internal URL for API Gateway
const INTERNAL_API_URL = 'http://api-gateway:8000/api/admin/storefront';

export interface ProductData {
  id: string;
  name: string;
  price: number;
  stock: number;
  sizeOptions: string[];
  sizeStocks: number[];
  variants: Array<{
    id: string;
    size: string;
    stock: number;
  }>;
}

export class CartService {
  async getCart(customerId: string) {
    let cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: true,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
        include: {
          items: true,
        },
      });
    }

    // Note: Hydration of items with product data should happen in the API layer or Frontend
    return cart;
  }

  async fetchProduct(productId: string): Promise<ProductData | null> {
    try {
      const res = await fetch(`${INTERNAL_API_URL}/products/${productId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`Error fetching product ${productId}:`, err);
      return null;
    }
  }

  async addToCart(customerId: string, productId: string, variantId: string, quantity: number) {
    if (!variantId) throw new Error("Variant harus dipilih.");
    if (quantity <= 0) throw new Error("Quantity tidak valid.");

    const cart = await this.getCart(customerId);
    const product = await this.fetchProduct(productId);

    if (!product) throw new Error("Produk tidak ditemukan.");
    
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) throw new Error("Variant tidak ditemukan.");
    if (variant.stock <= 0) throw new Error("Stok habis.");

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: variantId
        }
      }
    });

    const existingQty = existingItem?.quantity ?? 0;
    if (existingQty + quantity > variant.stock) {
      throw new Error(`Stok tidak cukup. Sisa: ${variant.stock}`);
    }

    return await prisma.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: variantId
        }
      },
      update: {
        quantity: { increment: quantity }
      },
      create: {
        cartId: cart.id,
        productId,
        productVariantId: variantId,
        quantity
      }
    });
  }

  async updateQuantity(customerId: string, itemId: string, quantity: number) {
    if (quantity <= 0) throw new Error("Quantity minimal 1.");

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!item || item.cart.customerId !== customerId) {
      throw new Error("Item tidak ditemukan.");
    }

    const product = await this.fetchProduct(item.productId);
    if (!product) throw new Error("Produk tidak ditemukan.");

    const variant = product.variants.find(v => v.id === item.productVariantId);
    if (!variant) throw new Error("Variant tidak ditemukan.");

    if (quantity > variant.stock) {
      throw new Error(`Stok tidak cukup. Sisa: ${variant.stock}`);
    }

    return await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });
  }

  async removeFromCart(customerId: string, itemId: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!item || item.cart.customerId !== customerId) {
      throw new Error("Item tidak ditemukan.");
    }

    return await prisma.cartItem.delete({
      where: { id: itemId }
    });
  }

  async clearCart(customerId: string) {
    const cart = await this.getCart(customerId);
    return await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
  }
}

export const cartService = new CartService();

import { cartRepository } from "../repositories/cartRepository";

export class CartService {
  async getCart(customerId: string) {
    return await cartRepository.getCartByCustomerId(customerId);
  }

  async addToCart(customerId: string, productId: string, variantId: string, quantity: number) {
    if (!variantId) {
      throw new Error("Variant harus dipilih sebelum menambahkan ke cart.");
    }

    if (!quantity || quantity <= 0) {
      throw new Error("Quantity tidak valid.");
    }

    const cart = await cartRepository.getCartByCustomerId(customerId);
    const variant = await cartRepository.getVariantById(variantId);

    if (!variant) {
      throw new Error("Variant produk tidak ditemukan.");
    }

    if (variant.productId !== productId) {
      throw new Error("Variant tidak sesuai dengan produk yang dipilih.");
    }

    if (variant.stock <= 0) {
      throw new Error("Stock untuk variant ini habis.");
    }

    const existingItem = await cartRepository.getCartItemByVariant(cart.id, variantId);
    const existingQty = existingItem?.quantity ?? 0;

    if (existingQty + quantity > variant.stock) {
      throw new Error(`Stock tidak cukup. Sisa stock: ${variant.stock}.`);
    }

    await cartRepository.addItemToCart(cart.id, productId, variantId, quantity);
    return await this.getCart(customerId);
  }

  async removeFromCart(customerId: string, itemId: string) {
    await cartRepository.removeItemFromCart(customerId, itemId);
    return await this.getCart(customerId);
  }

  async updateQuantity(customerId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error("Quantity minimal 1.");
    }

    const existingItem = await cartRepository.getCartItemWithVariant(itemId, customerId);
    if (!existingItem) {
      throw new Error("Item cart tidak ditemukan.");
    }

    if (existingItem.cart.customerId !== customerId) {
      throw new Error("Akses item cart tidak diizinkan.");
    }

    if (quantity > existingItem.variant.stock) {
      throw new Error(`Stock tidak cukup. Sisa stock: ${existingItem.variant.stock}.`);
    }

    await cartRepository.updateItemQuantity(customerId, itemId, quantity);
    return await this.getCart(customerId);
  }

  async clearCart(customerId: string) {
    await cartRepository.clearCart(customerId);
    return await this.getCart(customerId);
  }
}

export const cartService = new CartService();

import prisma from "../prisma/client";

export class CartRepository {
  async getCartByCustomerId(customerId: string) {
    let cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async addItemToCart(cartId: string, productId: string, variantId: string, quantity: number) {
    return await prisma.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId,
          productVariantId: variantId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId,
        productId,
        productVariantId: variantId,
        quantity,
      },
    });
  }

  async getVariantById(variantId: string) {
    return await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
  }

  async getCartItemByVariant(cartId: string, variantId: string) {
    return await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId,
          productVariantId: variantId,
        },
      },
    });
  }

  async getCartItemWithVariant(itemId: string, customerId: string) {
    return await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          customerId,
        },
      },
      include: {
        cart: {
          select: {
            customerId: true,
          },
        },
        variant: true,
      },
    });
  }

  async removeItemFromCart(customerId: string, itemId: string) {
    const result = await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cart: {
          customerId,
        },
      },
    });

    if (result.count === 0) {
      throw new Error("Item cart tidak ditemukan.");
    }

    return result;
  }

  async updateItemQuantity(customerId: string, itemId: string, quantity: number) {
    const result = await prisma.cartItem.updateMany({
      where: {
        id: itemId,
        cart: {
          customerId,
        },
      },
      data: { quantity },
    });

    if (result.count === 0) {
      throw new Error("Item cart tidak ditemukan.");
    }

    return result;
  }

  async clearCart(customerId: string) {
    return await prisma.cartItem.deleteMany({
      where: {
        cart: {
          customerId,
        },
      },
    });
  }
}

export const cartRepository = new CartRepository();

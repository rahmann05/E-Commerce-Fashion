import { Router } from 'express';
import { prisma } from '../infrastructure/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Secure all cart routes
// Internal URL for Commerce Service to fetch product/variant data directly
const COMMERCE_SERVICE_URL = process.env.COMMERCE_SERVICE_URL || 'http://commerce-service:3001';

router.use(authenticateJWT);

async function fetchProduct(productId: string) {
  try {
    // Call commerce-service directly inside Docker network
    const res = await fetch(`${COMMERCE_SERVICE_URL}/api/products/${productId}`);
    if (!res.ok) {
      console.error(`[Cart] fetchProduct failed for ${productId}: ${res.status}`);
      return null;
    }
    const json = await res.json() as any;
    const data = json.data;
    if (data) {
      // Ensure price is a number
      data.price = Number(data.price);
    }
    return data;
  } catch (err: any) {
    console.error(`[Cart] Error fetching product ${productId}:`, err.message);
    return null;
  }
}

// GET /api/storefront/cart - Fetch current user's cart with hydrated product data
router.get('/', async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.id;

    let cart = await prisma.cart.findUnique({
      where: { customerId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
        include: { items: true },
      });
    }

    // Hydrate items with product data from commerce-service
    const hydratedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        const product = await fetchProduct(item.productId);
        const variant = product?.variants?.find((v: any) => v.id === item.productVariantId);
        return {
          ...item,
          product: product ? {
            ...product,
            price: Number(product.price)
          } : null,
          variant
        };
      })
    );

    // Ensure we return the items inside a data object to match CartContext expectations
    res.json({
      success: true,
      data: {
        ...cart,
        items: hydratedItems
      },
    });
  } catch (error: any) {
    console.error('[Cart] GET Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch cart' });
  }
});

// POST /api/storefront/cart - Add item to cart
router.post('/', async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.id;
    const { productId, productVariantId, quantity } = req.body;

    if (!productId || !productVariantId) {
      return res.status(400).json({ success: false, error: 'Product and Variant ID are required' });
    }

    let cart = await prisma.cart.findUnique({ where: { customerId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { customerId } });
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

    // Return full hydrated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });

    const hydratedItems = await Promise.all(
      updatedCart!.items.map(async (item: any) => {
        const product = await fetchProduct(item.productId);
        const variant = product?.variants?.find((v: any) => v.id === item.productVariantId);
        return { ...item, product, variant };
      })
    );

    res.json({ success: true, data: { ...updatedCart, items: hydratedItems } });
  } catch (error: any) {
    console.error('[Cart] POST Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to add item' });
  }
});

// PUT /api/storefront/cart - Update item quantity
router.put('/', async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.id;
    const { itemId, quantity } = req.body;

    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });

    await prisma.cartItem.update({
      where: { id: itemId, cartId: cart.id },
      data: { quantity: Math.max(1, quantity) }
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });

    const hydratedItems = await Promise.all(
      updatedCart!.items.map(async (item: any) => {
        const product = await fetchProduct(item.productId);
        const variant = product?.variants?.find((v: any) => v.id === item.productVariantId);
        return { ...item, product, variant };
      })
    );

    res.json({ success: true, data: { ...updatedCart, items: hydratedItems } });
  } catch (error: any) {
    console.error('[Cart] PUT Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update quantity' });
  }
});

// DELETE /api/storefront/cart/:itemId - Remove item from cart
router.delete('/:itemId', async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.id;
    const itemId = req.params.itemId as string;

    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });

    await prisma.cartItem.delete({
      where: { id: itemId, cartId: cart.id },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });

    const hydratedItems = await Promise.all(
      updatedCart!.items.map(async (item: any) => {
        const product = await fetchProduct(item.productId);
        const variant = product?.variants?.find((v: any) => v.id === item.productVariantId);
        return { ...item, product, variant };
      })
    );

    res.json({ success: true, data: { ...updatedCart, items: hydratedItems } });
  } catch (error: any) {
    console.error('[Cart] DELETE Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to remove item' });
  }
});

// PATCH /api/storefront/cart - Clear cart
router.patch('/', async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.id;
    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ success: true, data: { ...cart, items: [] } });
  } catch (error: any) {
    console.error('[Cart] PATCH Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to clear cart' });
  }
});

export default router;
import { json } from '@sveltejs/kit';
import { cartService } from '@application/services/cart.service';

const SESSION_COOKIE_NAME = 'novure_uid';

function getCustomerId(cookies: any) {
  return cookies.get(SESSION_COOKIE_NAME);
}

export async function GET({ cookies }) {
  const customerId = getCustomerId(cookies);
  if (!customerId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const cart = await cartService.getCart(customerId);
    
    // Hydrate items with product details for the frontend
    const hydratedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await cartService.fetchProduct(item.productId);
        if (!product) return { ...item, product: null, variant: null };
        
        const variant = product.variants.find(v => v.id === item.productVariantId);
        return {
          ...item,
          product,
          variant
        };
      })
    );

    return json({
      success: true,
      data: { ...cart, items: hydratedItems },
      message: 'Cart retrieved'
    });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST({ request, cookies }) {
  const customerId = getCustomerId(cookies);
  if (!customerId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { productId, variantId, quantity } = await request.json();
    await cartService.addToCart(customerId, productId, variantId, quantity);
    return json({ success: true, message: 'Item added to cart' });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT({ request, cookies }) {
  const customerId = getCustomerId(cookies);
  if (!customerId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { itemId, quantity } = await request.json();
    await cartService.updateQuantity(customerId, itemId, quantity);
    return json({ success: true, message: 'Cart updated' });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE({ url, cookies }) {
  const customerId = getCustomerId(cookies);
  if (!customerId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const itemId = url.searchParams.get('itemId');
    if (!itemId) throw new Error("Item ID is required");
    await cartService.removeFromCart(customerId, itemId);
    return json({ success: true, message: 'Item removed from cart' });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH({ cookies }) {
  const customerId = getCustomerId(cookies);
  if (!customerId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    await cartService.clearCart(customerId);
    return json({ success: true, message: 'Cart cleared' });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';
import { cartService } from '@application/services/cart.service';

export async function GET({ params }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        items: true
      }
    });

    if (!order) return json({ success: false, error: 'Order not found' }, { status: 404 });

    // Hydrate items with product data
    const hydratedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await cartService.fetchProduct(item.productId);
        return {
          ...item,
          product
        };
      })
    );

    return json({
      success: true,
      data: { ...order, items: hydratedItems },
      message: 'Order details retrieved'
    });
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH({ params, request }) {
  try {
    const { status } = await request.json();
    
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status }
    });

    return json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

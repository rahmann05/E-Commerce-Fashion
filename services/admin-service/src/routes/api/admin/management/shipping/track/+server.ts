import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { orderId, carrierId, trackingNumber, estimatedArrival } = body;

    // Input Validation
    if (!orderId || typeof orderId !== 'string') {
      return json({ success: false, error: 'Valid orderId is required' }, { status: 400 });
    }
    if (!carrierId || typeof carrierId !== 'string') {
      return json({ success: false, error: 'Valid carrierId is required' }, { status: 400 });
    }
    if (!trackingNumber || typeof trackingNumber !== 'string') {
      return json({ success: false, error: 'Valid trackingNumber is required' }, { status: 400 });
    }

    const tracking = await prisma.$transaction(async (tx) => {
      // 1. Create tracking record
      const t = await tx.shippingTracking.create({
        data: {
          orderId,
          carrierId,
          trackingNumber,
          estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
          logs: {
            create: {
              status: "PICKED_UP",
              description: "Package has been picked up by the carrier."
            }
          }
        }
      });

      // 2. Update Order status to SHIPPED
      await tx.order.update({
        where: { id: orderId },
        data: { status: "SHIPPED" }
      });

      return t;
    });

    return json({ success: true, data: tracking });
  } catch (error: unknown) {
    console.error('SHIPPING_TRACK_INIT_ERROR', error);
    return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

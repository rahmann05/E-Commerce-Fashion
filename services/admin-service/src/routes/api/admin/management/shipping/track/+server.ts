import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function POST({ request }) {
  try {
    const { orderId, carrierId, trackingNumber, estimatedArrival } = await request.json();

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
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

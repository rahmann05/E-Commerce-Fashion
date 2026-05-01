import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { trackingId, status, location, description } = body;

    // Validation
    if (!trackingId || typeof trackingId !== 'string') {
      return json({ success: false, error: 'trackingId is required' }, { status: 400 });
    }
    if (!status || typeof status !== 'string') {
      return json({ success: false, error: 'status is required' }, { status: 400 });
    }

    const log = await prisma.$transaction(async (tx) => {
      // 1. Add log entry
      const l = await tx.shippingLog.create({
        data: { 
          trackingId, 
          status, 
          location, 
          description 
        }
      });

      // 2. Update current tracking status
      const updatedTracking = await tx.shippingTracking.update({
        where: { id: trackingId },
        data: { 
          currentStatus: status,
          lastLocation: location || undefined
        }
      });

      // 3. If status is DELIVERED, update Order status
      if (status === "DELIVERED") {
        await tx.order.update({
          where: { id: updatedTracking.orderId },
          data: { status: "DELIVERED" }
        });
      }

      return l;
    });

    return json({ success: true, data: log });
  } catch (error) {
    console.error('SHIPPING_LOG_POST_ERROR', error);
    
    // Check if it's a Prisma record not found error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return json({ success: false, error: 'Tracking record not found' }, { status: 404 });
    }

    return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

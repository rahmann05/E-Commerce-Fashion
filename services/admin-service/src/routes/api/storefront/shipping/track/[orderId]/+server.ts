import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '@infrastructure/database/prisma';

export const GET: RequestHandler = async ({ params }) => {
  const { orderId } = params;

  try {
    const tracking = await prisma.shippingTracking.findUnique({
      where: { orderId },
      include: {
        carrier: { select: { name: true, code: true } },
        logs: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!tracking) {
      return json({ success: false, error: "Tracking not found" }, { status: 404 });
    }

    return json({ success: true, data: tracking });
  } catch (error) {
    console.error('SHIPPING_TRACK_GET_ERROR', error);
    return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

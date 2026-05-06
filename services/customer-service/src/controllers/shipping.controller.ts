import { prisma } from '../db/client';

export class ShippingController {
  static async getTrackingByOrderId(orderId: string) {
    const tracking = await prisma.shippingTracking.findUnique({
      where: { orderId },
      include: {
        carrier: { select: { name: true, code: true } },
        logs: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!tracking) throw new Error("Tracking not found");

    return { data: tracking };
  }
}

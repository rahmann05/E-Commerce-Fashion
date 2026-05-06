import { prisma } from '@infrastructure/database/prisma';

export class AdminShippingController {
  static async getCarriers() {
    const carriers = await prisma.shippingCarrier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    return { data: carriers };
  }

  static async getTracking(trackingNumber: string) {
    const tracking = await prisma.shippingTracking.findFirst({
      where: { trackingNumber },
      include: {
        order: {
          select: { id: true, status: true }
        },
        logs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });
    return { data: tracking };
  }

  static async updateTracking(params: { trackingNumber: string, status: string, location?: string, description?: string }) {
    const { trackingNumber, status, location, description } = params;

    const existing = await prisma.shippingTracking.findFirst({
      where: { trackingNumber }
    });

    if (!existing) throw new Error("Tracking not found");

    const tracking = await prisma.shippingTracking.update({
      where: { id: existing.id },
      data: {
        currentStatus: status,
        lastLocation: location,
        logs: {
          create: {
            status,
            location,
            description
          }
        }
      }
    });

    return { data: tracking };
  }
}

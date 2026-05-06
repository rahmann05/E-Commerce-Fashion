import { prisma } from '@infrastructure/database/prisma';
import type { OrderStatus } from '@novure/database';

export class OrderController {
  static async getOrders(params: { status?: OrderStatus | undefined }) {
    const { status } = params;
    const orders = await prisma.order.findMany({
      where: { status },
      include: {
        customer: { select: { name: true, email: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { data: orders };
  }
}

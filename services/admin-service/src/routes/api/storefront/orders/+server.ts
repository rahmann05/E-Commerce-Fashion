import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

const SESSION_COOKIE_NAME = 'novure_uid';

export async function GET({ cookies }) {
  try {
    const customerId = cookies.get(SESSION_COOKIE_NAME);
    if (!customerId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });

    return json({
      success: true,
      data: orders,
      message: 'Orders retrieved'
    });
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';
import type { OrderStatus } from '@prisma/client';

export async function GET({ url }) {
  const status = url.searchParams.get('status') as OrderStatus || undefined;

  try {
    const orders = await prisma.order.findMany({
      where: { status },
      include: {
        customer: { select: { name: true, email: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return json({ success: true, data: orders });
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

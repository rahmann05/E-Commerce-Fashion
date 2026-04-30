import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function GET({ url }) {
  const status = url.searchParams.get('status') || undefined;

  try {
    const orders = await prisma.order.findMany({
      where: { status: status as any },
      include: {
        customer: { select: { name: true, email: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return json({ success: true, data: orders });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

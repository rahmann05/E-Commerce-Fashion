import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function GET() {
  try {
    const carriers = await prisma.shippingCarrier.findMany({ where: { isActive: true } });
    return json({ success: true, data: carriers });
  } catch (error: unknown) {
    console.error('SHIPPING_CARRIERS_GET_ERROR', error);
    return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

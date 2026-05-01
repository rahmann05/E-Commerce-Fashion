import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function GET() {
  try {
    const carriers = await prisma.shippingCarrier.findMany({ where: { isActive: true } });
    return json({ success: true, data: carriers });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

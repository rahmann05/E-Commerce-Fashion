import { json } from '@sveltejs/kit';
import { OrderController } from '../../../../../../modules/order/order.controller';
import type { OrderStatus } from '@novure/database';

export async function GET({ url }) {
  const status = url.searchParams.get('status') as OrderStatus || undefined;

  try {
    const result = await OrderController.getOrders({ status });
    return json({ success: true, data: result.data });
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

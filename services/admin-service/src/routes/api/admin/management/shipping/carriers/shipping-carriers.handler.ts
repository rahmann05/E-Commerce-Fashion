import { json } from '@sveltejs/kit';
import { AdminShippingController } from '../../../../../../modules/shipping/shipping.controller';

export async function GET() {
  try {
    const result = await AdminShippingController.getCarriers();
    return json({ success: true, data: result.data });
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

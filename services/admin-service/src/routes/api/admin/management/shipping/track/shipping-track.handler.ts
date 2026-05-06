import { json } from '@sveltejs/kit';
import { AdminShippingController } from '../../../../../../modules/shipping/shipping.controller';

export async function GET({ url }) {
  const trackingNumber = url.searchParams.get('number');
  if (!trackingNumber) return json({ success: false, error: 'Tracking number required' }, { status: 400 });

  try {
    const result = await AdminShippingController.getTracking(trackingNumber);
    return json({ success: true, data: result.data });
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { trackingNumber, status, location, description } = await request.json();
    const result = await AdminShippingController.updateTracking({ trackingNumber, status, location, description });
    return json({ success: true, data: result.data });
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

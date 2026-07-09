import { ORDER_API_URL, getInternalHeaders } from '$lib/api/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  let orderData = null;
  let tracking = null;

  try {
    const orderRes = await fetch(`${ORDER_API_URL}/${params.id}`, { headers: { ...getInternalHeaders() } });
    if (orderRes.ok) orderData = await orderRes.json();

    const trackRes = await fetch(`${ORDER_API_URL}/shipping/track/${params.id}`, { headers: { ...getInternalHeaders() } });
    if (trackRes.ok) {
      const trackData = await trackRes.json();
      tracking = trackData.data;
    }
  } catch (e) {
    console.error("Fetch error:", e);
  }

  return {
    order: orderData?.data || null,
    tracking
  };
};

import { API_BASE_URL, INTERNAL_API_URL, PUBLIC_API_URL } from '$lib/config';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
  let orderData = null;
  let carriersData = { data: [] };
  let tracking = null;

  try {
    const [orderRes, carriersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/orders/${params.id}`),
      fetch(`${INTERNAL_API_URL}/shipping/carriers`)
    ]);
    
    if (orderRes.ok) orderData = await orderRes.json();
    if (carriersRes.ok) carriersData = await carriersRes.json();

    if (orderData?.data?.status && ['SHIPPED', 'DELIVERED'].includes(orderData.data.status)) {
      const trackRes = await fetch(`${PUBLIC_API_URL}/shipping/track/${params.id}`);
      if (trackRes.ok) {
        const trackData = await trackRes.json();
        tracking = trackData.data;
      }
    }
  } catch (e) {
    console.error("Fetch error:", e);
  }

  return {
    order: orderData?.data || null,
    carriers: carriersData.data,
    tracking
  };
};

export const actions: Actions = {
  updateStatus: async ({ request, params, fetch }) => {
    try {
      const data = await request.formData();
      const status = data.get('status');
      const res = await fetch(`${API_BASE_URL}/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) return fail(res.status, { message: 'Failed to update status' });
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Network error updating status' });
    }
  },
  initTracking: async ({ request, params, fetch }) => {
    try {
      const data = await request.formData();
      const carrierId = data.get('carrierId');
      const trackingNumber = data.get('trackingNumber');
      
      const res = await fetch(`${INTERNAL_API_URL}/shipping/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: params.id, carrierId, trackingNumber })
      });
      
      if (!res.ok) return fail(res.status, { message: 'Failed to init tracking' });
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Network error initializing tracking' });
    }
  },
  addLog: async ({ request, fetch }) => {
    try {
      const data = await request.formData();
      const trackingId = data.get('trackingId');
      const status = data.get('status');
      const location = data.get('location');
      const description = data.get('description');

      const res = await fetch(`${INTERNAL_API_URL}/shipping/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId, status, location, description })
      });
      if (!res.ok) return fail(res.status, { message: 'Failed to add log' });
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Network error adding log' });
    }
  }
};

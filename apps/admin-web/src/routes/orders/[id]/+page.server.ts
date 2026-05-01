import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

const MANAGEMENT_API_URL = API_BASE_URL.replace('/storefront', '/management');

export const load: PageServerLoad = async ({ params, fetch }) => {
  const [orderRes, carriersRes] = await Promise.all([
    fetch(`${API_BASE_URL}/orders/${params.id}`),
    fetch(`${MANAGEMENT_API_URL}/shipping/carriers`)
  ]);
  
  if (!orderRes.ok) {
    return { order: null, carriers: [], tracking: null };
  }
  
  const orderData = await orderRes.json();
  const carriersData = carriersRes.ok ? await carriersRes.json() : { data: [] };

  let tracking = null;
  if (['SHIPPED', 'DELIVERED'].includes(orderData.data.status)) {
    const trackRes = await fetch(`${API_BASE_URL.replace('/admin/storefront', '/storefront')}/shipping/track/${params.id}`);
    if (trackRes.ok) {
      const trackData = await trackRes.json();
      tracking = trackData.data;
    }
  }

  return {
    order: orderData.data,
    carriers: carriersData.data,
    tracking
  };
};

export const actions: Actions = {
  updateStatus: async ({ request, params, fetch }) => {
    const data = await request.formData();
    const status = data.get('status');
    const res = await fetch(`${API_BASE_URL}/orders/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) return fail(res.status, { message: 'Failed to update' });
    return { success: true };
  },
  initTracking: async ({ request, params, fetch }) => {
    const data = await request.formData();
    const carrierId = data.get('carrierId');
    const trackingNumber = data.get('trackingNumber');
    
    const res = await fetch(`${MANAGEMENT_API_URL}/shipping/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: params.id, carrierId, trackingNumber })
    });
    
    if (!res.ok) return fail(res.status, { message: 'Failed to init tracking' });
    return { success: true };
  },
  addLog: async ({ request, fetch }) => {
    const data = await request.formData();
    const trackingId = data.get('trackingId');
    const status = data.get('status');
    const location = data.get('location');
    const description = data.get('description');

    const res = await fetch(`${MANAGEMENT_API_URL}/shipping/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingId, status, location, description })
    });
    if (!res.ok) return fail(res.status, { message: 'Failed to add log' });
    return { success: true };
  }
};
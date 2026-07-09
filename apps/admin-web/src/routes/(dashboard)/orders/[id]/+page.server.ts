import { COMMERCE_API_URL, ORDER_API_URL, ADMIN_API_URL, getInternalHeaders } from '$lib/api/config';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
  let orderData = null;
  let carriersData = { data: [] };
  let tracking = null;

  try {
    const [orderRes, carriersRes] = await Promise.all([
      fetch(`${ORDER_API_URL}/${params.id}`, { headers: { ...getInternalHeaders() } }),
      fetch(`${ORDER_API_URL}/shipping/carriers`, { headers: { ...getInternalHeaders() } })
    ]);
    
    if (orderRes.ok) orderData = await orderRes.json();
    if (carriersRes.ok) carriersData = await carriersRes.json();

    if (orderData?.data?.status && ['SHIPPED', 'DELIVERED'].includes(orderData.data.status)) {
      const trackRes = await fetch(`${ORDER_API_URL}/shipping/track/${params.id}`, { headers: { ...getInternalHeaders() } });
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
      const res = await fetch(`${ORDER_API_URL}/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getInternalHeaders() },
        body: JSON.stringify({ status })
      });
      if (!res.ok) return fail(res.status, { message: 'Failed to update status' });
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Network error updating status' });
    }
  },
  cancelOrder: async ({ params, fetch }) => {
    try {
      const res = await fetch(`${ORDER_API_URL}/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getInternalHeaders() },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      if (!res.ok) return fail(res.status, { message: 'Failed to cancel order' });
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Network error canceling order' });
    }
  },
  initTracking: async ({ request, params, fetch }) => {
    try {
      const data = await request.formData();
      const carrierId = data.get('carrierId');
      // Automatically generate a tracking number (mocking logistics API response)
      const trackingNumber = `NVR-${Math.floor(Math.random() * 100000000)}`;
      
      const res = await fetch(`${ORDER_API_URL}/shipping/tracking/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getInternalHeaders() },
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
      const trackingNumber = data.get('trackingNumber');
      const status = data.get('status');
      const location = data.get('location');
      const description = data.get('description');

      const res = await fetch(`${ORDER_API_URL}/shipping/tracking/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getInternalHeaders() },
        body: JSON.stringify({ trackingNumber, status, location, description })
      });
      if (!res.ok) return fail(res.status, { message: 'Failed to add log' });
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Network error adding log' });
    }
  }
};

import { orderApi } from '$lib/api/order.api';
import { ORDER_API_URL, getInternalHeaders } from '$lib/api/config';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch }) => {
  const returnsData = await orderApi.getReturns(fetch);

  return {
    returns: returnsData?.data || []
  };
};

export const actions: Actions = {
  updateStatus: async ({ request, fetch }) => {
    try {
      const data = await request.formData();
      const id = data.get('id');
      const status = data.get('status');
      
      const res = await fetch(`${ORDER_API_URL}/returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getInternalHeaders() },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) return fail(res.status, { message: 'Failed to update return status' });
      return { success: true };
    } catch (e) {
      return fail(500, { message: 'Network error updating return' });
    }
  }
};

import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await fetch(`${API_BASE_URL}/orders/${params.id}`);
	if (!res.ok) throw error(404, 'Order not found');
	
	const result = await res.json();
	return {
		order: result.data
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

		if (!res.ok) return fail(500, { message: 'Failed to update status' });

		return { success: true };
	}
};

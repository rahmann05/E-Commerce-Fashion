import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch(`${API_BASE_URL}/categories`);
	const result = await res.json();

	return {
		categories: result.data || []
	};
};

export const actions: Actions = {
	create: async ({ request, fetch }) => {
		const data = await request.formData();
		const name = data.get('name') as string;

		if (!name) return fail(400, { message: 'Name is required' });

		const res = await fetch(`${API_BASE_URL}/categories`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		});

		const result = await res.json();
		if (!res.ok || !result.success) return fail(500, { message: result.error || 'Failed to create category' });

		return { success: true };
	},
	delete: async ({ request, fetch }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
			method: 'DELETE'
		});

		const result = await res.json();
		if (!res.ok || !result.success) {
			return fail(res.status, { message: result.error || 'Failed to delete category' });
		}

		return { success: true };
	}
};

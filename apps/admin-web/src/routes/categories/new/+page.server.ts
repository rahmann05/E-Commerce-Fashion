import { API_BASE_URL } from '$lib/config';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const data = await request.formData();
		const name = data.get('name') as string;

		if (!name) return fail(400, { message: 'Name is required' });

		const res = await fetch(`${API_BASE_URL}/categories`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		});

		const result = await res.json();
		if (!res.ok || !result.success) {
			return fail(res.status, { message: result.error || 'Failed to create collection' });
		}

		throw redirect(303, '/categories');
	}
};

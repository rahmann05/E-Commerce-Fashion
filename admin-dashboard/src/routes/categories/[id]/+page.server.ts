import { API_BASE_URL } from '$lib/config';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const [categoryRes, allProductsRes] = await Promise.all([
		fetch(`${API_BASE_URL}/categories/${params.id}`),
		fetch(`${API_BASE_URL}/products`)
	]);

	if (!categoryRes.ok) throw error(404, 'Collection not found');

	const [category, allProducts] = await Promise.all([
		categoryRes.json(),
		allProductsRes.json()
	]);

	return {
		category,
		allProducts
	};
};

export const actions: Actions = {
	update: async ({ params, request, fetch }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const description = data.get('description') as string;
		const image = data.get('image') as string;

		if (!name) return fail(400, { message: 'Collection name is required' });

		const res = await fetch(`${API_BASE_URL}/categories/${params.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, description, image })
		});

		if (!res.ok) return fail(500, { message: 'Failed to update collection' });

		return { success: true };
	},
	delete: async ({ params, fetch }) => {
		const res = await fetch(`${API_BASE_URL}/categories/${params.id}`, {
			method: 'DELETE'
		});

		if (!res.ok) {
			const data = await res.json();
			return fail(res.status, { message: data.error || 'Failed to delete collection' });
		}

		throw redirect(303, '/categories');
	}
};

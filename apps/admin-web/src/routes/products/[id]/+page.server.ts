import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const [productRes, categoriesRes] = await Promise.all([
		fetch(`${API_BASE_URL}/products/${params.id}`),
		fetch(`${API_BASE_URL}/categories`)
	]);

	if (!productRes.ok) throw error(404, 'Product not found');

	const [product, categories] = await Promise.all([
		productRes.json(),
		categoriesRes.json()
	]);

	return {
		product,
		categories
	};
};

export const actions: Actions = {
	update: async ({ request, params, fetch }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const description = data.get('description') as string;
		const price = parseFloat(data.get('price') as string);
		const sizeOptions = data.getAll('sizeOptions') as string[];
		const sizeStocks = data.getAll('sizeStocks').map(s => parseInt(s as string));
		const categoryId = data.get('categoryId') as string;
		const inStock = data.get('inStock') === 'on';
		const imageUrl = data.get('imageUrl') as string;

		const totalStock = sizeStocks.reduce((acc, curr) => acc + curr, 0);

		const res = await fetch(`${API_BASE_URL}/products/${params.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name,
				description,
				price,
				imageUrl,
				stock: totalStock,
				sizeOptions,
				sizeStocks,
				categoryId,
				inStock: inStock && totalStock > 0
			})
		});

		if (!res.ok) return fail(500, { message: 'Failed to update product' });

		return { success: true };
	},
	delete: async ({ params, fetch }) => {
		const res = await fetch(`${API_BASE_URL}/products/${params.id}`, {
			method: 'DELETE'
		});

		if (!res.ok) return fail(500, { message: 'Failed to delete product' });

		throw redirect(303, '/products');
	}
};

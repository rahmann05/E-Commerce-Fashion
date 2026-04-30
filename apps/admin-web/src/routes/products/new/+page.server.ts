import { API_BASE_URL } from '$lib/config';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch(`${API_BASE_URL}/categories`);
	const result = await res.json();
	return {
		categories: result.data || []
	};
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const description = data.get('description') as string;
		const price = parseFloat(data.get('price') as string);
		const sizeOptions = data.getAll('sizeOptions') as string[];
		const sizeStocks = data.getAll('sizeStocks').map(s => parseInt(s as string));
		const categoryId = data.get('categoryId') as string;

		const totalStock = sizeStocks.reduce((acc, curr) => acc + curr, 0);
		const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

		const res = await fetch(`${API_BASE_URL}/products`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name,
				slug,
				description,
				price,
				stock: totalStock,
				sizeOptions,
				sizeStocks,
				categoryId
			})
		});

		const result = await res.json();
		if (!res.ok || !result.success) {
			return fail(res.status, { message: result.error || 'Failed to create product' });
		}

		throw redirect(303, '/products');
	}
};

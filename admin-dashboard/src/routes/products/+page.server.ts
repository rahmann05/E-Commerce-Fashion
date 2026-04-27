import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const query = url.searchParams.get('q') || '';
	const categoryId = url.searchParams.get('category') || '';
	
	const productsUrl = new URL(`${API_BASE_URL}/products`);
	if (query) productsUrl.searchParams.set('q', query);
	if (categoryId) productsUrl.searchParams.set('category', categoryId);

	const [productsRes, categoriesRes] = await Promise.all([
		fetch(productsUrl.toString()),
		fetch(`${API_BASE_URL}/categories`)
	]);

	const [productsResult, categoriesResult] = await Promise.all([
		productsRes.json(),
		categoriesRes.json()
	]);

	return {
		products: productsResult.data || [],
		categories: categoriesResult.data || [],
		query,
		currentCategory: categoryId
	};
};

import { productsApi } from '@lib/api/products';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const query = url.searchParams.get('q') || '';
	const categoryId = url.searchParams.get('category') || '';
	
	const [productsResult, categoriesResult] = await Promise.all([
		productsApi.getProducts(fetch, query, categoryId),
		productsApi.getCategories(fetch)
	]);

	return {
		products: productsResult.data || [],
		categories: categoriesResult.data || [],
		query,
		currentCategory: categoryId
	};
};

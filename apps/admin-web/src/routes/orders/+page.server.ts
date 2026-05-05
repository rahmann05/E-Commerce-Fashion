import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const status = url.searchParams.get('status') || '';
	const dateRange = url.searchParams.get('range') || 'all';
	
	const ordersUrl = new URL(`${API_BASE_URL}/orders`);
	if (status) ordersUrl.searchParams.set('status', status);
	if (dateRange) ordersUrl.searchParams.set('range', dateRange);

	const res = await fetch(ordersUrl.toString());
	const payload = await res.json();
	const orders = payload.success ? payload.data : [];

	return {
		orders,
		currentStatus: status || undefined,
		currentRange: dateRange
	};
};

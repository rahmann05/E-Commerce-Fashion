import { ordersApi } from '@lib/api/orders';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const status = url.searchParams.get('status') || '';
	const dateRange = url.searchParams.get('range') || 'all';
	
	const ordersResult = await ordersApi.getOrders(fetch);

	return {
		orders: ordersResult.data || [],
		currentStatus: status || undefined,
		currentRange: dateRange
	};
};

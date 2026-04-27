import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch(`${API_BASE_URL}/analytics`);
	if (!res.ok) {
		return {
			summary: { totalRevenue: 0, orderCount: 0, userCount: 0, revenueThisMonth: 0, revenueGrowth: 0, aov: 0, newCustomers: 0 },
			finance: { grossProfit: 0, estimatedCOGS: 0, margin: 0 },
			topProducts: [],
			categoryDistribution: [],
			geographicDistribution: [],
			dailyData: Array(30).fill(0)
		};
	}
	const result = await res.json();
	return result.data;
};

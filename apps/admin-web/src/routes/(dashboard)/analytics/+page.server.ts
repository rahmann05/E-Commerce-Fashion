import { analyticsApi } from '@lib/api/analytics';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const analyticsResult = await analyticsApi.getAnalytics(fetch);
	
	if (!analyticsResult.data) {
		return {
			summary: { totalRevenue: 0, orderCount: 0, userCount: 0, revenueThisMonth: 0, revenueGrowth: 0, aov: 0, newCustomers: 0 },
			finance: { grossProfit: 0, estimatedCOGS: 0, margin: 0 },
			topProducts: [],
			categoryDistribution: [],
			geographicDistribution: [],
			dailyData: Array(30).fill(0)
		};
	}
	
	return analyticsResult.data;
};

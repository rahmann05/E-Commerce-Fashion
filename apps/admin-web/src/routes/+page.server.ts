import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  const [analyticsRes, ordersRes] = await Promise.all([
    fetch(`${API_BASE_URL}/analytics`),
    fetch(`${API_BASE_URL}/orders?limit=5`) // Assuming backend supports limit, else we slice in UI
  ]);

  const analytics = analyticsRes.ok ? await analyticsRes.json() : { data: null };
  const orders = ordersRes.ok ? await ordersRes.json() : { data: [] };

  return {
    analytics: analytics.data || {
      summary: { totalRevenue: 0, revenueGrowth: 0 },
      finance: { grossProfit: 0 },
      successRate: 100
    },
    recentOrders: (orders.data || []).slice(0, 5)
  };
};
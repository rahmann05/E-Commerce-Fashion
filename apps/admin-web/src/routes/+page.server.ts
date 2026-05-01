import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad } from './$types';

const safeFetch = async (promise: Promise<Response>) => {
  try {
    const res = await promise;
    return res.ok ? await res.json() : { data: null };
  } catch (e) {
    console.error("Fetch error:", e);
    return { data: null };
  }
};

export const load: PageServerLoad = async ({ fetch }) => {
  const [analytics, orders] = await Promise.all([
    safeFetch(fetch(`${API_BASE_URL}/analytics`)),
    safeFetch(fetch(`${API_BASE_URL}/orders?limit=5`))
  ]);

  return {
    analytics: analytics.data || {
      summary: { totalRevenue: 0, revenueGrowth: 0 },
      finance: { grossProfit: 0 },
      successRate: 100
    },
    recentOrders: (orders.data || []).slice(0, 5)
  };
};
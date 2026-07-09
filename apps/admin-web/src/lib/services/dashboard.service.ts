/**
 * lib/services/dashboard.service.ts
 * SRP: Dashboard data aggregation service.
 * Orchestrates multiple API clients to compose the overview data.
 * This is a SERVICE, not an API client — it lives in lib/services/, not lib/api/.
 */

import { analyticsApi } from '$lib/api/analytics.api';
import { orderApi } from '$lib/api/order.api';

export const dashboardService = {
  async getOverview(fetch: typeof globalThis.fetch) {
    const [analytics, orders] = await Promise.all([
      analyticsApi.getAnalytics(fetch),
      orderApi.getOrders(fetch) // Fetch all orders to compute metrics
    ]);

    const rawAnalytics = analytics.data || {};
    const allOrders = orders.data || [];

    // Calculate Financial Metrics
    const validOrders = allOrders.filter((o: any) => !['CANCELLED', 'RETURNED', 'REFUNDED', 'AWAITING_PAYMENT'].includes(o.status));
    const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0);
    const grossProfit = totalRevenue * 0.25; // Example 25% margin
    const successRate = allOrders.length > 0 
      ? Math.round((validOrders.length / allOrders.length) * 100) 
      : 100;

    return {
      analytics: {
        ...rawAnalytics,
        summary: rawAnalytics.summary || { totalRevenue, revenueGrowth: 15 },
        finance: rawAnalytics.finance || { grossProfit },
        successRate: successRate
      },
      recentOrders: allOrders.slice(0, 5),
      allOrders
    };
  }
};

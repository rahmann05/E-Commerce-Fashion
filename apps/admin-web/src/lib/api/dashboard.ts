import { analyticsApi } from './analytics';
import { ordersApi } from './orders';

export class DashboardAPI {
  static async getOverview(fetch: any) {
    const [analytics, orders] = await Promise.all([
      analyticsApi.getAnalytics(fetch),
      ordersApi.getOrders(fetch, 5)
    ]);

    return {
      analytics: analytics.data || {
        summary: { totalRevenue: 0, revenueGrowth: 0 },
        finance: { grossProfit: 0 },
        successRate: 100
      },
      recentOrders: (orders.data || []).slice(0, 5)
    };
  }
}

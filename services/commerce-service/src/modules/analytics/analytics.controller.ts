import prisma from "@/infrastructure/database/prisma";

export class AnalyticsController {
  static async getAnalytics() {
    const categorySales = await prisma.product.findMany({
      select: {
        category: { select: { name: true } }
      }
    });

    const categoryMap = new Map<string, number>();
    categorySales.forEach((p) => {
      const cat = p.category?.name || 'Uncategorized';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    return {
      summary: {
        totalRevenue: 0,
        orderCount: 0,
        customerCount: 0,
        revenueThisMonth: 0,
        newCustomers: 0
      },
      categoryDistribution,
      topProducts: [],
      dailyData: []
    };
  }
}

import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

const COMMERCE_API_URL = process.env.COMMERCE_API_URL || 'http://localhost:3001/api/admin';

export async function GET() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  try {
    const [
      totalRevenue,
      orderCount,
      customerCount,
      revenueThisMonth,
      revenuePrevMonth,
      dailyRevenueRaw,
      newCustomers,
      topProductsRaw,
      geographicDistributionRaw,
      catalogAnalyticsRes
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
        _sum: { totalAmount: true }
      }),
      prisma.order.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { totalAmount: true }
      }),
      prisma.customer.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      prisma.address.groupBy({
        by: ['province'],
        _count: { _all: true },
        orderBy: { _count: { province: 'desc' } },
        take: 5
      }),
      fetch(`${COMMERCE_API_URL}/analytics`).then(res => res.json()).catch(() => ({ data: {} }))
    ]);

    const currentRev = Number(totalRevenue._sum.totalAmount || 0);
    const revThisMonth = Number(revenueThisMonth._sum.totalAmount || 0);
    const revPrevMonth = Number(revenuePrevMonth._sum.totalAmount || 0);
    const catalogData = catalogAnalyticsRes.data || {};

    const revenueGrowth = revPrevMonth === 0 ? 100 : Math.round(((revThisMonth - revPrevMonth) / revPrevMonth) * 100);
    const aov = orderCount === 0 ? 0 : Math.round(currentRev / orderCount);

    // Finance Metrics (Based on 35% overhead logic from UI)
    const estimatedCOGS = Math.round(currentRev * 0.65);
    const grossProfit = currentRev - estimatedCOGS;
    const margin = currentRev === 0 ? 0 : Math.round((grossProfit / currentRev) * 100);

    // Fetch product names for top products
    const productsRes = await fetch(`${COMMERCE_API_URL}/products`).then(res => res.json()).catch(() => ({ data: [] }));
    const productMap = new Map((productsRes.data || []).map((p: any) => [p.id, p.name]));

    const topProducts = topProductsRaw.map((p: any) => ({
      productId: p.productId,
      name: productMap.get(p.productId) || 'Unknown Product',
      quantity: p._sum.quantity,
      revenue: Number(p._sum.price)
    }));

    const geographicDistribution = geographicDistributionRaw.map((r: any) => ({
      province: r.province,
      count: r._count._all
    }));

    // Daily Data alignment (ensure 30 items)
    const dailyMap = new Map(dailyRevenueRaw.map((d: any) => [d.createdAt.toISOString().split('T')[0], Number(d._sum.totalAmount)]));
    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      return dailyMap.get(d.toISOString().split('T')[0]) || 0;
    });

    return json({
      success: true,
      data: {
        summary: {
          totalRevenue: currentRev,
          orderCount,
          customerCount,
          revenueThisMonth: revThisMonth,
          revenueGrowth,
          aov,
          newCustomers
        },
        finance: {
          grossProfit,
          estimatedCOGS,
          margin
        },
        categoryDistribution: catalogData.categoryDistribution || [],
        topProducts,
        geographicDistribution,
        dailyData
      },
      message: "Analytics data unified from Neon and Supabase"
    });
  } catch (error: any) {
    console.error("ADMIN_ANALYTICS_ERROR", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function GET() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const [
      totalRevenue,
      orderCount,
      customerCount,
      revenueThisMonth,
      dailyRevenue,
      newCustomers
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true }
      }),
      prisma.order.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { totalAmount: true }
      }),
      prisma.customer.count({
        where: { createdAt: { gte: startOfMonth } }
      })
    ]);

    const currentRev = Number(totalRevenue._sum.totalAmount || 0);

    return json({
      success: true,
      data: {
        summary: {
          totalRevenue: currentRev,
          orderCount,
          customerCount,
          revenueThisMonth: Number(revenueThisMonth._sum.totalAmount || 0),
          newCustomers
        },
        dailyData: dailyRevenue
      },
      message: "Analytics data retrieved from Neon"
    });
  } catch (error: any) {
    console.error("ADMIN_ANALYTICS_ERROR", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@infrastructure/database/prisma";

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
      topProducts,
      categorySales,
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
      prisma.order.aggregate({
        where: { 
          createdAt: { 
            gte: startOfPrevMonth,
            lte: endOfPrevMonth
          } 
        },
        _sum: { totalAmount: true }
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      prisma.product.findMany({
        select: {
          category: { select: { name: true } }
        }
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
    
    // Process Category Distribution
    const categoryMap = new Map<string, number>();
    categorySales.forEach((p: any) => {
      const cat = p.category?.name || 'Uncategorized';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: currentRev,
          orderCount,
          customerCount,
          revenueThisMonth: Number(revenueThisMonth._sum.totalAmount || 0),
          newCustomers
        },
        categoryDistribution,
        topProducts,
        dailyData: dailyRevenue
      },
      message: "Analytics data retrieved successfully"
    });
  } catch (error: any) {
    console.error("ADMIN_ANALYTICS_ERROR", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

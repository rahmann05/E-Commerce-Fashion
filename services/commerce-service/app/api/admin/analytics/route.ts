import { NextResponse } from "next/server";
import prisma from "@infrastructure/database/prisma";

export async function GET() {
  try {
    const [
      categorySales,
    ] = await Promise.all([
      prisma.product.findMany({
        select: {
          category: { select: { name: true } }
        }
      })
    ]);

    // Metrics for these have moved to admin-service
    const topProducts: unknown[] = [];
    const dailyRevenue: unknown[] = [];

    // Process Category Distribution
    const categoryMap = new Map<string, number>();
    categorySales.forEach((p) => {
      const cat = p.category?.name || 'Uncategorized';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: 0,
          orderCount: 0,
          customerCount: 0,
          revenueThisMonth: 0,
          newCustomers: 0
        },
        categoryDistribution,
        topProducts,
        dailyData: dailyRevenue
      },
      message: "Analytics data retrieved successfully (Order/Customer metrics moved to admin-service)"
    });
  } catch (error) {
    console.error("ADMIN_ANALYTICS_ERROR", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

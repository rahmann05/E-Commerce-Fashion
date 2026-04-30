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
      categorySales,
    ] = await Promise.all([
      prisma.product.findMany({
        select: {
          category: { select: { name: true } }
        }
      })
    ]);

    // Metrics for these have moved to admin-service
    const totalRevenue = { _sum: { totalAmount: 0 } };
    const orderCount = 0;
    const customerCount = 0;
    const revenueThisMonth = { _sum: { totalAmount: 0 } };
    const newCustomers = 0;
    const topProducts: any[] = [];
    const dailyRevenue: any[] = [];

    const currentRev = 0;
    
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
  } catch (error: any) {
    console.error("ADMIN_ANALYTICS_ERROR", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

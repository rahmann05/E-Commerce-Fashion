import prisma from "../db/client";

export class AnalyticsService {
  static async getDashboardMetrics() {
    const [totalProducts, totalCategories, outOfStock] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.product.count({ where: { stock: 0 } })
    ]);

    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        category: { select: { name: true } },
        createdAt: true
      }
    });

    return {
      metrics: {
        totalProducts,
        totalCategories,
        outOfStock
      },
      recentProducts
    };
  }
}

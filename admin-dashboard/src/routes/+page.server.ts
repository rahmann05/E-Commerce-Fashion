import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const now = new Date();
	const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	const [
		productCount,
		lowStockCount,
		outOfStockCount,
		ordersAwaitingFulfillment, // Status: PROCESSING
		ordersToday,
		revenueToday,
		totalRevenue,
		recentOrders,
		topSellingProducts,
		monthlyRevenue
	] = await Promise.all([
		prisma.product.count(),
		prisma.product.count({ where: { stock: { gt: 0, lt: 10 } } }),
		prisma.product.count({ where: { stock: 0 } }),
		prisma.order.count({ where: { status: 'PROCESSING' } }),
		prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
		prisma.order.aggregate({
			where: { createdAt: { gte: startOfDay } },
			_sum: { totalAmount: true }
		}),
		prisma.order.aggregate({
			_sum: { totalAmount: true }
		}),
		prisma.order.findMany({
			take: 5,
			orderBy: { createdAt: 'desc' },
			include: { user: true }
		}),
		prisma.orderItem.groupBy({
			by: ['productId', 'name', 'imageUrl'],
			_sum: { quantity: true },
			orderBy: { _sum: { quantity: 'desc' } },
			take: 5
		}),
		prisma.order.groupBy({
			by: ['createdAt'],
			where: { createdAt: { gte: startOfMonth } },
			_sum: { totalAmount: true }
		})
	]);

	// Calculate Sales Velocity (Orders per day this week)
	const salesVelocity = await prisma.order.count({
		where: { createdAt: { gte: startOfWeek } }
	}) / 7;

	// Process monthly data for Velocity Chart
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const chartData = Array.from({ length: 6 }, (_, i) => {
		const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
		return {
			month: months[d.getMonth()],
			value: Math.floor(Math.random() * 50) + 20, // Replace with real logic if needed, currently scaling for visual
			active: d.getMonth() === now.getMonth()
		};
	});

	return {
		businessMetrics: {
			fulfillmentQueue: ordersAwaitingFulfillment,
			inventoryAlerts: {
				low: lowStockCount,
				out: outOfStockCount
			},
			performance: {
				salesToday: ordersToday,
				revenueToday: Number(revenueToday._sum.totalAmount || 0),
				totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
				aov: ordersToday > 0 ? Number(revenueToday._sum.totalAmount || 0) / ordersToday : 0,
				velocity: salesVelocity.toFixed(1)
			}
		},
		topProducts: topSellingProducts.map(p => ({
			name: p.name,
			count: p._sum.quantity,
			image: p.imageUrl
		})),
		recentOrders: JSON.parse(JSON.stringify(recentOrders)),
		chartData
	};
};

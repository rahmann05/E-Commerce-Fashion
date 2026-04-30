import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// TODO: Refactor direct DB access to fetch data from API Gateway (Core Commerce API)
	// The models Product, Order, OrderItem are now in the Storefront database (Supabase).
	
	const productCount = 100;
	const lowStockCount = 5;
	const outOfStockCount = 2;
	const ordersAwaitingFulfillment = 10;
	const ordersToday = 25;
	const revenueToday = 1500000;
	const totalRevenue = 50000000;
	
	const recentOrders = [];
	const topSellingProducts = [];
	const salesVelocity = 15;

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const chartData = Array.from({ length: 6 }, (_, i) => {
		const now = new Date();
		const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
		return {
			month: months[d.getMonth()],
			value: Math.floor(Math.random() * 50) + 20,
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
				revenueToday,
				totalRevenue,
				aov: ordersToday > 0 ? revenueToday / ordersToday : 0,
				velocity: salesVelocity.toFixed(1)
			}
		},
		topProducts: topSellingProducts.map(p => ({
			name: p.name,
			count: p._sum?.quantity || 0,
			image: p.imageUrl
		})),
		recentOrders,
		chartData
	};
};
import { prisma } from '@infrastructure/database/prisma';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return json({
			status: "HEALTHY",
			database: "CONNECTED",
			timestamp: new Date().toISOString()
		});
	} catch (error: any) {
		console.error("Admin Health Check Error:", error);
		return json({
			status: "UNHEALTHY",
			database: "DISCONNECTED",
			error: error.message
		}, { status: 503 });
	}
};

import prisma from "@/infrastructure/database/prisma";

export class HealthController {
  static async checkHealth() {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: "HEALTHY",
      database: "CONNECTED",
      timestamp: new Date().toISOString()
    };
  }
}

import { NextResponse } from "next/server";
import { HealthController } from "@/modules/health/health.controller";

export async function GET() {
  try {
    const result = await HealthController.checkHealth();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Health Check Error:", error);
    return NextResponse.json({
      status: "UNHEALTHY",
      database: "DISCONNECTED",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 503 });
  }
}

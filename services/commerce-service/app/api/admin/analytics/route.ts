import { NextResponse } from "next/server";
import { AnalyticsController } from "@/modules/analytics/analytics.controller";

export async function GET() {
  try {
    const result = await AnalyticsController.getAnalytics();
    return NextResponse.json({
      success: true,
      data: result,
      message: "Analytics data retrieved successfully"
    });
  } catch (error) {
    console.error("ADMIN_ANALYTICS_ERROR", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

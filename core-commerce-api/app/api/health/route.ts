import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";

export async function GET() {
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: "HEALTHY",
      database: "CONNECTED",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health Check Error:", error);
    return NextResponse.json({
      status: "UNHEALTHY",
      database: "DISCONNECTED",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 503 });
  }
}

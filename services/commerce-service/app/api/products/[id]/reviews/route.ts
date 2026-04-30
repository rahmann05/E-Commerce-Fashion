import { NextResponse } from "next/server";
import prisma from "@infrastructure/database/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
    });

    const aggregate = await prisma.review.aggregate({
      where: { productId: id },
      _count: true,
      _avg: { rating: true },
    });

    // Format into parallel arrays for headless consumer
    return NextResponse.json({
      success: true,
      data: {
        ratings: reviews.map(r => r.rating),
        comments: reviews.map(r => r.comment),
        details: reviews.map(r => ({
          id: r.id,
          customerName: "Verified Buyer",
          customerImage: "",
          date: r.createdAt
        })),
        summary: {
          total: aggregate._count,
          average: aggregate._avg.rating || 0,
        }
      }
    });
  } catch (error: any) {
    console.error("[API] Product reviews error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

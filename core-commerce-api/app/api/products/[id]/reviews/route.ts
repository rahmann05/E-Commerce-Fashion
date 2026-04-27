import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        customer: {
          select: { name: true, image: true },
        },
      },
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
          customerName: r.customer.name,
          customerImage: r.customer.image,
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

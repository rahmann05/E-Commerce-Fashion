import { NextResponse } from "next/server";
import prisma from "@infrastructure/database/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            customer: {
              select: { name: true, image: true },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Transform reviews into two-dimensional style (parallel arrays)
    const reviewData = {
      ratings: product.reviews.map(r => r.rating),
      comments: product.reviews.map(r => r.comment),
      details: product.reviews.map(r => ({
        id: r.id,
        customerName: r.customer.name,
        customerImage: r.customer.image,
        date: r.createdAt
      }))
    };

    // Calculate average rating dynamically to ensure precision
    const totalRating = reviewData.ratings.reduce((acc, curr) => acc + curr, 0);
    const averageRating = reviewData.ratings.length > 0 
      ? Number((totalRating / reviewData.ratings.length).toFixed(1)) 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        reviews: reviewData,
        calculatedRating: averageRating
      },
      message: "Product retrieved successfully",
    });
  } catch (error) {
    console.error("GET_PRODUCT_DETAIL_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

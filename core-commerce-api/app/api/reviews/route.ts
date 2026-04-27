import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "novure_uid";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!customerId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { productId, orderId, rating, comment } = await req.json();

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1-5" }, { status: 400 });
    }

    // 1. Validasi Pembelian
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: { items: true }
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    
    const hasItem = order.items.some(i => i.productId === productId);
    if (!hasItem) return NextResponse.json({ success: false, error: "Product not in this order" }, { status: 400 });

    // 2. Cek apakah sudah review
    const existing = await prisma.review.findFirst({
      where: { customerId, productId, orderId }
    });
    if (existing) return NextResponse.json({ success: false, error: "Already reviewed" }, { status: 400 });

    // 3. Simpan Review Relasional
    const review = await prisma.review.create({
      data: {
        customerId,
        productId,
        orderId,
        rating,
        comment: comment || ""
      }
    });

    // 4. Update Product (Headless Style - Parallel Arrays & Precision Rating)
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true, comment: true }
    });

    const ratings = allReviews.map(r => r.rating);
    const comments = allReviews.map(r => r.comment || "");
    const totalRating = ratings.reduce((acc, curr) => acc + curr, 0);
    const averageRating = totalRating / ratings.length;

    await prisma.product.update({
      where: { id: productId },
      data: { 
        rating: averageRating,
        reviewRatings: ratings,
        reviewComments: comments
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        review,
        newAverageRating: Number(averageRating.toFixed(2))
      },
      message: "Review submitted successfully" 
    });
  } catch (error: any) {
    console.error("[API] Submit Review Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

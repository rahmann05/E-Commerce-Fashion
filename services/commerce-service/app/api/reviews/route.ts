import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ReviewController } from "@/modules/review/review.controller";

const SESSION_COOKIE_NAME = "novure_uid";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!customerId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { productId, orderId, rating, comment } = await req.json();

    const result = await ReviewController.submitReview({ customerId, productId, orderId, rating, comment });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: "Review submitted successfully" 
    });
  } catch (error) {
    console.error("[API] Submit Review Error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

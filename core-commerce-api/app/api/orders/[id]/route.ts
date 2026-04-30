import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "novure_uid";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
        customerId // Ensure customer only sees their own orders
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error("[API] Order Detail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

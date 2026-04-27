import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";
import midtransClient from "midtrans-client";

const snap = new (midtransClient as any).Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: orderId } = await params;

  try {
    const statusResponse = await snap.transaction.status(orderId);
    
    let orderStatus: "AWAITING_PAYMENT" | "PROCESSING" | "CANCELLED" | "SHIPPED" | "DELIVERED" = "AWAITING_PAYMENT";
    const transactionStatus = statusResponse.transaction_status;

    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      orderStatus = "PROCESSING";
    } else if (transactionStatus === "pending") {
      orderStatus = "AWAITING_PAYMENT";
    } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
      orderStatus = "CANCELLED";
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus },
      include: { items: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        midtrans: statusResponse,
        order: updatedOrder
      }
    });
  } catch (error: any) {
    console.error("[API] Midtrans status error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

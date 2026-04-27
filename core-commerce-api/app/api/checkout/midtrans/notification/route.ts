import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";
import midtransClient from "midtrans-client";

const snap = new (midtransClient as any).Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});

export async function POST(req: Request) {
  try {
    const notification = await req.json();

    const statusResponse = await snap.transaction.notification(notification);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let orderStatus: "AWAITING_PAYMENT" | "PROCESSING" | "CANCELLED" | "SHIPPED" | "DELIVERED" = "AWAITING_PAYMENT";

    const isSuccess = (transactionStatus === "capture" && fraudStatus === "accept") || transactionStatus === "settlement";

    if (isSuccess) {
      orderStatus = "PROCESSING";
      
      // LOGIC: Deduct Inventory from Parallel Arrays
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
      });

      if (order && order.status === "AWAITING_PAYMENT") {
        for (const item of order.items) {
          if (!item.size) continue;
          
          const sizeIndex = item.product.sizeOptions.indexOf(item.size);
          if (sizeIndex !== -1) {
            const newSizeStocks = [...item.product.sizeStocks];
            newSizeStocks[sizeIndex] = Math.max(0, newSizeStocks[sizeIndex] - item.quantity);
            
            const newTotalStock = newSizeStocks.reduce((a, b) => a + b, 0);

            await prisma.product.update({
              where: { id: item.productId },
              data: {
                sizeStocks: newSizeStocks,
                stock: newTotalStock,
                inStock: newTotalStock > 0
              }
            });
          }
        }
      }
    } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
      orderStatus = "CANCELLED";
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus },
    });

    return NextResponse.json({ success: true, message: "Notification handled" });
  } catch (error: any) {
    console.error("[API] Midtrans notification error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

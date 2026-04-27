import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";
import midtransClient from "midtrans-client";
import { cookies } from "next/headers";

const snap = new (midtransClient as any).Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});

const SESSION_COOKIE_NAME = "novure_uid";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { 
        cart: { 
          include: { 
            items: { 
              include: { 
                product: true,
                variant: true
              } 
            } 
          } 
        } 
      }
    });

    if (!customer || !customer.cart || customer.cart.items.length === 0) {
      return NextResponse.json({ success: false, error: "Keranjang belanja kosong." }, { status: 400 });
    }

    // Validate Stocks for each item
    for (const item of customer.cart.items) {
      const sizeIndex = item.product.sizeOptions.indexOf(item.variant.size);
      const availableStock = item.product.sizeStocks[sizeIndex] || 0;
      
      if (availableStock < item.quantity) {
        return NextResponse.json({ 
          success: false, 
          error: `Stok untuk ${item.product.name} ukuran ${item.variant.size} tidak mencukupi (Tersisa: ${availableStock}).` 
        }, { status: 400 });
      }
    }

    const totalAmount = customer.cart.items.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0);

    // Create Order with Size Information
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        totalAmount,
        status: "AWAITING_PAYMENT",
        items: {
          create: customer.cart.items.map(item => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            size: item.variant.size,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      }
    });

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      data: {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        orderId: order.id
      },
      message: "Transaksi berhasil dibuat."
    });
  } catch (error: any) {
    console.error("[API] Checkout error:", error);
    return NextResponse.json({ success: false, error: error.message || "Gagal memproses transaksi." }, { status: 500 });
  }
}

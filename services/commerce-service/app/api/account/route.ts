import { NextResponse } from "next/server";
import prisma from "@infrastructure/database/prisma";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "novure_uid";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        addresses: true,
        orders: {
          include: { items: true },
          orderBy: { createdAt: "desc" }
        },
        wishlist: {
          include: { product: true }
        }
      },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: customer,
      message: "Account details retrieved successfully"
    });
  } catch (error: any) {
    console.error("[API] Account error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const body = await req.json();

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: body.name,
        phone: body.phone,
        image: body.image
      }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Profile updated successfully"
    });
  } catch (error: any) {
    console.error("[API] Account update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

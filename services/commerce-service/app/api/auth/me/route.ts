import { NextResponse } from "next/server";
import prisma from "@infrastructure/database/prisma";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "novure_uid";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name ?? customer.email.split("@")[0],
        email: customer.email,
        phone: customer.phone,
        joinedAt: customer.createdAt.toISOString(),
      },
      message: "Session retrieved successfully",
    });
  } catch (error) {
    console.error("[API] Auth Me error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

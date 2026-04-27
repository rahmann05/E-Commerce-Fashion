import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });
    if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const { status } = await request.json();
    const updated = await prisma.order.update({
      where: { id },
      data: { status }
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

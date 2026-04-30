import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!category) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { name, description, image } = await request.json();
    const updated = await prisma.category.update({
      where: { id },
      data: { name, image }
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) return NextResponse.json({ success: false, error: "Cannot delete category with products" }, { status: 400 });
    
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

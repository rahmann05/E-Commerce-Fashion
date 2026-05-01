import { NextResponse } from "next/server";
import prisma from "@infrastructure/database/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true }
    });
    if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await request.json();
    
    const updateData: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
      image?: string[];
      isFeatured?: boolean;
    } = {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
      image: data.images,
      isFeatured: data.isFeatured
    };

    if (data.name && !data.slug) {
      updateData.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    } else if (data.slug) {
      updateData.slug = data.slug;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

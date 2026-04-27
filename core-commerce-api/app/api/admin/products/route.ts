import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category");

  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryId || undefined,
        OR: q ? [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } }
        ] : undefined
      },
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        sizeOptions: data.sizeOptions,
        sizeStocks: data.sizeStocks,
        categoryId: data.categoryId,
        images: data.images || []
      }
    });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

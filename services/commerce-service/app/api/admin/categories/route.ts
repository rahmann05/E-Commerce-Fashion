import { NextResponse } from "next/server";
import prisma from "@infrastructure/database/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, image } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });

    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const category = await prisma.category.create({
      data: { name, slug, image }
    });
    return NextResponse.json({
      success: true,
      data: category
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

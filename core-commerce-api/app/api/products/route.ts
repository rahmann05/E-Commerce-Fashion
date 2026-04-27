import { NextResponse } from "next/server";
import prisma from "@/backend/prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const query = searchParams.get("q");

  try {
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        ...(categoryId && { categoryId }),
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: products,
      message: "Products retrieved successfully",
    });
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/infrastructure/database/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const categoryName = searchParams.get("category");
  const query = searchParams.get("q");

  try {
    // If filtering by category name, look up the category ID first
    let resolvedCategoryId = categoryId;

    if (categoryName && categoryName !== "all" && !resolvedCategoryId) {
      const mappedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      const category = await prisma.category.findFirst({
        where: {
          name: {
            mode: 'insensitive',
            equals: mappedName
          }
        },
        select: { id: true }
      });

      if (category) {
        resolvedCategoryId = category.id;
      } else {
        // Category not found — return empty
        return NextResponse.json({
          success: true,
          data: [],
          message: "No products found for this category",
        });
      }
    }

    // Build the product query
    const where: Prisma.ProductWhereInput = {
      stock: { gt: 0 }
    };

    if (resolvedCategoryId) {
      where.categoryId = resolvedCategoryId;
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: products || [],
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

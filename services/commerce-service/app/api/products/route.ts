import { NextResponse } from "next/server";
import { ProductController } from "@/modules/product/product.controller";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const categoryName = searchParams.get("category");
  const query = searchParams.get("q");
  const idsParam = searchParams.get("ids");

  try {
    const result = await ProductController.getProducts({ categoryId, categoryName, query, idsParam });
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.data.length === 0 ? "No products found" : "Products retrieved successfully",
    });
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

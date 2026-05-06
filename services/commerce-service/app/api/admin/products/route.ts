import { NextResponse } from "next/server";
import { ProductController } from "@/modules/product/product.controller";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category");

  try {
    const result = await ProductController.getAdminProducts({ q, categoryId });
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  const adminKey = req.headers.get('x-admin-key');
  const userId = req.headers.get('x-user-id');

  if (!authHeader && !adminKey && !userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const result = await ProductController.createProduct(data);
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

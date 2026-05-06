import { NextResponse } from "next/server";
import { CategoryController } from "@/modules/category/category.controller";

export async function GET() {
  try {
    const result = await CategoryController.getCategories();
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await CategoryController.createCategory(data);
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

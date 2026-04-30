import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables in Core API");
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
      const { data: categories } = await supabase
        .from("Category")
        .select("id")
        .ilike("name", mappedName)
        .limit(1);

      if (categories && categories.length > 0) {
        resolvedCategoryId = categories[0].id;
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
    let supabaseQuery = supabase
      .from("Product")
      .select(`
        *,
        category:Category(name)
      `)
      .eq("inStock", true);

    if (resolvedCategoryId) {
      supabaseQuery = supabaseQuery.eq("categoryId", resolvedCategoryId);
    }

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: products, error } = await supabaseQuery.order("createdAt", { ascending: false });

    if (error) {
      console.error("SUPABASE_QUERY_ERROR", error);
      throw error;
    }

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

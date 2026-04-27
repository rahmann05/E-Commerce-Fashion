import { NextResponse } from "next/server";
import { cartService } from "@/backend/services/cartService";

function getAuthenticatedCustomerId(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/novure_uid=([^;]+)/);
  const customerId = match ? match[1] : null;
  return customerId?.trim() || null;
}

export async function GET(req: Request) {
  try {
    const customerId = getAuthenticatedCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const cart = await cartService.getCart(customerId);
    return NextResponse.json({
      success: true,
      data: cart,
      message: "Cart retrieved successfully"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const customerId = getAuthenticatedCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { productId, variantId, quantity } = await req.json();
    const cart = await cartService.addToCart(customerId, productId, variantId, quantity);
    return NextResponse.json({
      success: true,
      data: cart,
      message: "Item added to cart"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const customerId = getAuthenticatedCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, quantity } = await req.json();
    const cart = await cartService.updateQuantity(customerId, itemId, quantity);
    return NextResponse.json({
      success: true,
      data: cart,
      message: "Cart updated"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("PUT /api/cart error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const customerId = getAuthenticatedCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) throw new Error("Item ID is required");
    const cart = await cartService.removeFromCart(customerId, itemId);
    return NextResponse.json({
      success: true,
      data: cart,
      message: "Item removed from cart"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const customerId = getAuthenticatedCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const cart = await cartService.clearCart(customerId);
    return NextResponse.json({
      success: true,
      data: cart,
      message: "Cart cleared"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("PATCH /api/cart error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

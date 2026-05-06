import { NextResponse } from "next/server";
import { ShippingController } from "@/modules/shipping/shipping.controller";

export async function POST(request: Request) {
  try {
    const { lat, lng, city } = await request.json();
    const result = ShippingController.calculateShipping({ lat, lng, city });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Shipping API error:", msg);
    return NextResponse.json({ success: false, error: "Sistem Ekspedisi Gagal", details: msg }, { status: 500 });
  }
}

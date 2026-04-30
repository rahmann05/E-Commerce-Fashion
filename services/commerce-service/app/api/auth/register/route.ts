import { NextResponse } from "next/server";
import prisma from "@infrastructure/database/prisma";
import { hashPassword } from "@application/auth/password";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const normalizedPassword = String(password ?? "").trim();
    const normalizedName = String(name ?? "").trim();

    if (!normalizedEmail || !normalizedPassword || !normalizedName) {
      return NextResponse.json(
        { success: false, error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    // Create customer
    const hashedPassword = await hashPassword(normalizedPassword);
    const customer = await prisma.customer.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: normalizedName,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: customer.id, email: customer.email, name: customer.name },
      message: "Akun berhasil dibuat. Silakan login.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Register error:", message);
    return NextResponse.json(
      { success: false, error: "Gagal membuat akun. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

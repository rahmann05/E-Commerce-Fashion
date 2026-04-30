import { NextResponse } from "next/server";
import prisma from "@infrastructure/database/prisma";
import { hashPassword, verifyPassword } from "@application/auth/password";

const SESSION_COOKIE_NAME = "novure_uid";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const normalizedPassword = String(password ?? "").trim();

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(normalizedPassword, customer.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name ?? customer.email.split("@")[0],
        email: customer.email,
        phone: customer.phone,
        joinedAt: customer.createdAt.toISOString(),
      },
      message: "Login berhasil.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, customer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Login error:", message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

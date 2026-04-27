/**
 * lib/auth.ts
 * Client-side session utilities backed by secure server cookie via API Gateway.
 */

import type { SessionUser } from "@/lib/mock-users";

/** Resolve current user from session cookie */
export async function getSessionFromCookie(): Promise<SessionUser | null> {
  try {
    const res = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;
    const result = await res.json();
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/** Clear server-side session cookie */
export async function logoutUser(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    keepalive: true,
  });
}

/** Attempt to log in; returns session user or error string */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: SessionUser } | { error: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    
    if (!res.ok || !result.success) {
      return { error: result.error ?? "Gagal login." };
    }
    
    return { user: result.data };
  } catch {
    return { error: "Terjadi gangguan jaringan saat login." };
  }
}

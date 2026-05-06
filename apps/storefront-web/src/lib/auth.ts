/**
 * lib/auth.ts
 * Backward compatible auth utilities using the new authApi client.
 */

import { authApi } from "./api/auth";
import type { SessionUser } from "@/context/AuthContext";

export async function getSessionFromCookie(): Promise<SessionUser | null> {
  return authApi.getMe();
}

export async function logoutUser(): Promise<void> {
  return authApi.logout();
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: SessionUser } | { error: string }> {
  const result = await authApi.login(email, password);
  if (result.success && result.data) {
    return { user: result.data };
  }
  return { error: result.error || "Gagal login." };
}

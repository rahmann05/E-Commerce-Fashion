/**
 * lib/api/auth.ts
 * API client for Authentication and Identity.
 */

import { API_BASE_URL, fetchOptions } from "./config";
import type { SessionUser } from "@/context/AuthContext";

export const authApi = {
  /** Resolve current user from session cookie */
  async getMe(): Promise<SessionUser | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, fetchOptions({
        method: "GET",
        cache: "no-store",
      }));

      if (!res.ok) return null;
      const result = await res.json();
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  },

  /** Attempt to log in */
  async login(email: string, password: string): Promise<{ success: boolean; data?: SessionUser; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, fetchOptions({
        method: "POST",
        body: JSON.stringify({ email, password }),
      }));
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        return { success: false, error: result.error ?? result.message ?? "Gagal login." };
      }
      
      return { success: true, data: result.data };
    } catch {
      return { success: false, error: "Terjadi gangguan jaringan saat login." };
    }
  },

  /** Clear session cookie */
  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, fetchOptions({
      method: "POST",
      keepalive: true,
    }));
  }
};

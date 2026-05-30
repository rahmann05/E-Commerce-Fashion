/**
 * lib/api/auth.ts
 * API client for Authentication and Identity.
 */

import { CUSTOMER_API_URL, fetchOptions } from "../lib/config";
import type { SessionUser } from "@/core/providers/AuthContext";

export const authApi = {
  /** Resolve current user from session cookie */
  async getMe(): Promise<SessionUser | null> {
    try {
      const res = await fetch(`${CUSTOMER_API_URL}/auth/me`, fetchOptions({
        method: "GET",
        cache: "no-store",
      }));

      if (!res.ok) return null;
      const result = await res.json();
      return result.success ? (result.data?.user || result.data) : null;
    } catch {
      return null;
    }
  },

  /** Attempt to log in */
  async login(email: string, password: string): Promise<{ success: boolean; data?: SessionUser; error?: string }> {
    try {
      const res = await fetch(`${CUSTOMER_API_URL}/auth/login`, fetchOptions({
        method: "POST",
        body: JSON.stringify({ email, password }),
      }));
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        return { success: false, error: result.error ?? result.message ?? "Gagal login." };
      }
      
      return { success: true, data: result.data?.user || result.data };
    } catch {
      return { success: false, error: "Terjadi gangguan jaringan saat login." };
    }
  },

  /** Attempt to register */
  async register(data: Record<string, unknown>): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    try {
      const res = await fetch(`${CUSTOMER_API_URL}/auth/register`, fetchOptions({
        method: "POST",
        body: JSON.stringify(data),
      }));
      const result = await res.json();
      if (result.success && result.data?.user) {
        result.data = result.data.user;
      }
      return result;
    } catch {
      return { success: false, error: "Terjadi gangguan jaringan saat mendaftar." };
    }
  },

  /** Clear session cookie */
  async logout(): Promise<void> {
    await fetch(`${CUSTOMER_API_URL}/auth/logout`, fetchOptions({
      method: "POST",
      keepalive: true,
    }));
  }
};

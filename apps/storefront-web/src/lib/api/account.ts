/**
 * lib/api/account.ts
 * API client for User Account and Profile management.
 */

import { API_BASE_URL, fetchOptions } from "./config";

export interface AccountResponse {
  success: boolean;
  data?: Record<string, unknown>;
  message?: string;
  error?: string;
}

export const accountApi = {
  /**
   * Get full account profile data
   */
  async getProfile(): Promise<AccountResponse | null> {
    const res = await fetch(`${API_BASE_URL}/account/profile`, fetchOptions());
    if (!res.ok) return null;
    return await res.json();
  },

  /**
   * Mutate account data (save profile, addresses, etc.)
   */
  async mutateAccount(action: string, body: Record<string, unknown>): Promise<AccountResponse | null> {
    const res = await fetch(`${API_BASE_URL}/account`, fetchOptions({
      method: "POST",
      body: JSON.stringify({ action, ...body }),
    }));
    if (!res.ok) return null;
    return await res.json();
  }
};

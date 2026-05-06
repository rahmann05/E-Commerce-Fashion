/**
 * lib/api/account.ts
 * API client for User Account and Profile management.
 */

import { API_BASE_URL, fetchOptions } from "./config";

export const accountApi = {
  /**
   * Get full account profile data
   */
  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/account/profile`, fetchOptions());
    if (!res.ok) return null;
    return await res.json();
  },

  /**
   * Mutate account data (save profile, addresses, etc.)
   */
  async mutateAccount(action: string, body: Record<string, unknown>) {
    const res = await fetch(`${API_BASE_URL}/account`, fetchOptions({
      method: "POST",
      body: JSON.stringify({ action, ...body }),
    }));
    if (!res.ok) return null;
    return await res.json();
  }
};

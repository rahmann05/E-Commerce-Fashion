/**
 * lib/api/analytics.ts
 * API client for Business Intelligence and Analytics.
 */

import { COMMERCE_API_URL, getInternalHeaders } from "./config";

export const analyticsApi = {
  /**
   * Get high-level business analytics
   */
  async getAnalytics(fetch: any) {
    try {
      const res = await fetch(`${COMMERCE_API_URL}/analytics`, { headers: { ...getInternalHeaders() } });
      if (!res.ok) return { data: null, error: `Fetch failed: ${res.status}` };
      return await res.json();
    } catch (e: any) {
      console.error(`[analyticsApi] Error:`, e.message);
      return { data: null, error: e.message };
    }
  }
};

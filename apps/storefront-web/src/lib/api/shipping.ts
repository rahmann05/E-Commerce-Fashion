/**
 * lib/api/shipping.ts
 * API client for Shipping and Logistics calculations.
 */

import { API_BASE_URL, fetchOptions } from "./config";

export interface ShippingParams {
  lat: number;
  lng: number;
  city: string;
}

export interface CourierOption {
  id: string;
  label: string;
  fee: number;
}

export interface ShippingResponse {
  success: boolean;
  distance_km: number;
  couriers: CourierOption[];
  city: string;
  error?: string;
}

export const shippingApi = {
  /**
   * Calculate shipping fees based on location
   */
  async calculateShipping(params: ShippingParams): Promise<ShippingResponse> {
    const res = await fetch(`${API_BASE_URL}/shipping/calculate`, fetchOptions({
      method: "POST",
      body: JSON.stringify(params),
    }));
    
    if (!res.ok) throw new Error("Failed to fetch shipping options");
    return await res.json();
  }
};

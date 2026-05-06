/**
 * lib/api/reviews.ts
 * API client for product reviews.
 */

import { API_BASE_URL, fetchOptions } from "./config";

export interface ReviewUser {
  name: string | null;
  image: string | null;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

export interface ReviewsSummary {
  total: number;
  average: number;
}

export interface ReviewsResponse {
  success: boolean;
  reviews: ReviewItem[];
  summary: ReviewsSummary;
  error?: string;
}

export interface SubmitReviewResponse {
  success: boolean;
  error?: string;
}

export const reviewsApi = {
  async getProductReviews(productId: string): Promise<ReviewsResponse> {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, fetchOptions({
      method: "GET",
      cache: "no-store",
    }));
    return await res.json();
  },

  async submitReview(params: { productId: string; orderId: string; rating: number; comment?: string }): Promise<SubmitReviewResponse> {
    const res = await fetch(`${API_BASE_URL}/reviews`, fetchOptions({
      method: "POST",
      body: JSON.stringify(params),
    }));
    return await res.json();
  }
};

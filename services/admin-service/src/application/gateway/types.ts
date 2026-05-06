/**
 * Shared API response envelope types for the Novure Gateway.
 * All service responses MUST conform to ApiResponse<T>.
 */

/** Standard success/error envelope used by all services. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Auth token returned alongside data on login endpoints. */
export interface AuthTokenResponse<T = unknown> extends ApiResponse<T> {
  token?: string;
}

// ── Admin types ────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name?: string | null;
}

// ── Storefront / Customer types ────────────────────────────────────────────────

export interface CustomerProfile {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  stock: number;
  categoryId?: string | null;
  image?: string[];
  variants?: ProductVariant[];
  category?: { name: string };
}

export interface ProductVariant {
  id: string;
  size: string;
  color?: string | null;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

export interface Order {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productVariantId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  productVariantId: string;
  quantity: number;
  product?: Product | null;
  variant?: ProductVariant | null;
}

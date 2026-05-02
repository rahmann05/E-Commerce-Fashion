"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../components/catalogue/types";

export interface ProductVariant {
  id: string;
  size: string;
  color?: string;
  stock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  productVariantId: string;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/storefront";
  };

  useEffect(() => {
    let mounted = true;
    const initCart = async () => {
      try {
        setIsLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("novure_jwt") : null;
        const res = await fetch(`${getApiBaseUrl()}/cart`, {
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
        });
        if (res.ok && mounted) {
          const result = await res.json();
          setItems(result.data?.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    initCart();
    return () => { mounted = false; };
  }, []);

  const addToCart = async (product: Product, variantId: string, quantity = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("novure_jwt") : null;
      const res = await fetch(`${getApiBaseUrl()}/cart`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productId: product.id, productVariantId: variantId, quantity }),
      });
      
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to add to cart");
      
      setItems(result.data?.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("novure_jwt") : null;
      const res = await fetch(`${getApiBaseUrl()}/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to remove item");
      
      setItems(result.data?.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("novure_jwt") : null;
      const res = await fetch(`${getApiBaseUrl()}/cart`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ itemId, quantity }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to update quantity");
      
      setItems(result.data?.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearError = () => setError(null);

  const clearCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("novure_jwt") : null;
      const res = await fetch(`${getApiBaseUrl()}/cart`, {
        method: "PATCH",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to clear cart");
      
      setItems([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const p = Number(item.product?.price ?? 0);
    const actualPrice = p < 10000 ? p * 1000 : p;
    return sum + actualPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalItems,
        totalPrice,
        isLoading,
        error,
        clearError,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

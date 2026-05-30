"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/core/providers/AuthContext";
import type { CartItem } from "@/core/providers/CartContext";
import { accountApi } from "@/shared/api/account";
import { Product } from "@/features/catalogue/types";

export type ProfileOrderStatus = "awaiting_payment" | "processing" | "shipped" | "delivered" | "cancelled";

export interface ProfileAddress {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isPrimary: boolean;
}

export interface ProfileOrderItem {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
  product?: Product;
}

export interface ProfileOrder {
  id: string;
  createdAt: string;
  status: ProfileOrderStatus | string;
  total: number;
  shipping: number;
  items: ProfileOrderItem[];
  address?: ProfileAddress;
}

export interface WishlistItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  category: string;
}

export interface ProfileVoucher {
  id: string;
  code: string;
  title: string;
  expiresAt: string;
}

export interface ProfileNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface UserProfileData {
  phone: string;
  addresses: ProfileAddress[];
  orders: ProfileOrder[];
  wishlist: WishlistItem[];
  vouchers: ProfileVoucher[];
  notifications: ProfileNotification[];
}

interface ProfileDataContextValue {
  phone: string;
  addresses: ProfileAddress[];
  orders: ProfileOrder[];
  wishlist: WishlistItem[];
  vouchers: ProfileVoucher[];
  notifications: ProfileNotification[];
  saveProfileInfo: (payload: { name: string; phone: string }) => Promise<{ success: boolean; message?: string }>;
  addAddress: (payload: Omit<ProfileAddress, "id" | "isPrimary">) => Promise<{ success: boolean; address?: ProfileAddress; message?: string }>;
  updateAddress: (id: string, payload: Partial<Omit<ProfileAddress, "id">>) => Promise<{ success: boolean; message?: string }>;
  removeAddress: (id: string) => Promise<{ success: boolean; message?: string }>;
  placeOrderFromCart: (payload: {
    items: CartItem[];
    shipping: number;
    total: number;
  }) => ProfileOrder | null;
  toggleWishlistItem: (item: WishlistItem) => void;
  removeWishlistItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  markNotificationRead: (id: string) => void;
  submitCheckout: (payload: {
    items: CartItem[];
    shipping: number;
    total: number;
    addressId: string;
    courier: string;
    notes?: string;
    promoCode?: string;
  }) => Promise<{ success: boolean; orderId?: string; message?: string }>;
  refreshAccountData: () => Promise<void>;
  updatePassword: (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => { success: boolean; message: string };
}

const ProfileDataContext = createContext<ProfileDataContextValue | null>(null);

const EMPTY_DATA: UserProfileData = {
  phone: "",
  addresses: [],
  orders: [],
  wishlist: [],
  vouchers: [],
  notifications: [],
};

export function ProfileDataProvider({ children }: { children: ReactNode }) {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState<UserProfileData>(EMPTY_DATA);

  const refreshAccountData = useCallback(async () => {
    if (!user) {
      setData(EMPTY_DATA);
      return;
    }
    const payload = await accountApi.getProfile();
    if (payload && payload.data) {
      setData(payload.data as unknown as UserProfileData);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshAccountData();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshAccountData]);

  const callMutation = useCallback(
    async (action: string, body: Record<string, unknown>): Promise<UserProfileData | null> => {
      if (!user) return null;
      const payload = await accountApi.mutateAccount(action, body);
      if (payload && payload.data) {
        const nextData = payload.data as unknown as UserProfileData;
        setData(nextData);
        return nextData;
      }
      return null;
    },
    [user]
  );

  const saveProfileInfo = useCallback(
    async ({ name, phone }: { name: string; phone: string }) => {
      if (!user) return { success: false, message: "User belum login." };
      updateUser({ name, phone });
      const res = await callMutation("saveProfileInfo", { name, phone });
      return { success: !!res, message: res ? "Profil berhasil diperbarui." : "Gagal menyimpan ke server." };
    },
    [user, updateUser, callMutation]
  );

  const addAddress = useCallback(
    async (payload: Omit<ProfileAddress, "id" | "isPrimary">) => {
      updateUser({ address: payload.line1 });
      const newData = await callMutation("addAddress", payload);
      if (newData && newData.addresses && newData.addresses.length > 0) {
        return { success: true, address: newData.addresses[newData.addresses.length - 1] };
      }
      return { success: false, message: "Gagal menyimpan alamat." };
    },
    [updateUser, callMutation]
  );

  const updateAddress = useCallback(
    async (id: string, payload: Partial<Omit<ProfileAddress, "id">>) => {
      const res = await callMutation("updateAddress", { id, ...payload });
      if (res && (payload.isPrimary || payload.line1)) {
        const primaryAddr = res.addresses.find(a => a.isPrimary);
        if (primaryAddr) {
          updateUser({ address: primaryAddr.line1 });
        }
      }
      return { success: !!res };
    },
    [callMutation, updateUser]
  );

  const removeAddress = useCallback(
    async (id: string) => {
      const res = await callMutation("removeAddress", { id });
      return { success: !!res };
    },
    [callMutation]
  );

  const placeOrderFromCart = useCallback(
    ({ items, shipping, total }: { items: CartItem[]; shipping: number; total: number }) => {
      if (!user || items.length === 0) return null;
      const address = data.addresses[0];
      if (!address) return null;
      void callMutation("createOrder", {
        items,
        shipping,
        total,
        addressId: address.id,
        courier: "JNE Regular",
      });
      return {
        id: `NVR-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "processing" as const,
        total,
        shipping,
        items: [],
      };
    },
    [user, data.addresses, callMutation]
  );

  const toggleWishlistItem = useCallback(
    (item: WishlistItem) => {
      void callMutation("toggleWishlistItem", { item });
    },
    [callMutation]
  );

  const removeWishlistItem = useCallback(
    (productId: string) => {
      void callMutation("removeWishlistItem", { productId });
    },
    [callMutation]
  );

  const isWishlisted = useCallback(
    (productId: string) => data.wishlist.some((item) => item.productId === productId),
    [data.wishlist]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      void callMutation("markNotificationRead", { id });
    },
    [callMutation]
  );

  const submitCheckout = useCallback(
    async (payload: {
      items: CartItem[];
      shipping: number;
      total: number;
      addressId: string;
      courier: string;
      notes?: string;
      promoCode?: string;
    }) => {
      if (!user) return { success: false, message: "User belum login." };
      const next = await callMutation("createOrder", payload);
      if (!next) return { success: false, message: "Gagal membuat pesanan." };
      return { success: true, orderId: next.orders && (next.orders as any[])[0]?.id };
    },
    [user, callMutation]
  );

  const updatePassword = useCallback(
    ({
      currentPassword,
      newPassword,
      confirmPassword,
    }: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, message: "Semua field password wajib diisi." };
      }
      if (newPassword.length < 8) {
        return { success: false, message: "Password baru minimal 8 karakter." };
      }
      if (newPassword !== confirmPassword) {
        return { success: false, message: "Konfirmasi password tidak cocok." };
      }
      return { success: true, message: "Password berhasil diperbarui." };
    },
    []
  );

  const value = useMemo<ProfileDataContextValue>(
    () => ({
      phone: data.phone,
      addresses: data.addresses,
      orders: data.orders,
      wishlist: data.wishlist,
      vouchers: data.vouchers,
      notifications: data.notifications,
      saveProfileInfo,
      addAddress,
      updateAddress,
      removeAddress,
      placeOrderFromCart,
      toggleWishlistItem,
      removeWishlistItem,
      isWishlisted,
      markNotificationRead,
      submitCheckout,
      refreshAccountData,
      updatePassword,
    }),
    [
      data,
      saveProfileInfo,
      addAddress,
      updateAddress,
      removeAddress,
      placeOrderFromCart,
      toggleWishlistItem,
      removeWishlistItem,
      isWishlisted,
      markNotificationRead,
      submitCheckout,
      refreshAccountData,
      updatePassword,
    ]
  );

  return <ProfileDataContext.Provider value={value}>{children}</ProfileDataContext.Provider>;
}

export function useProfileData(): ProfileDataContextValue {
  const ctx = useContext(ProfileDataContext);
  if (!ctx) {
    throw new Error("useProfileData must be used within a <ProfileDataProvider>");
  }
  return ctx;
}

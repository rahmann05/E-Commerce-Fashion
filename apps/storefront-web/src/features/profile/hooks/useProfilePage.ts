import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/core/providers/AuthContext";
import { useProfileData } from "@/core/providers/ProfileDataContext";

export type TabId = "overview" | "orders" | "wishlist" | "reviews" | "address" | "vouchers" | "security" | "notifications";

function toTab(value: string | null): TabId {
  const allowed: TabId[] = [
    "overview", "orders", "wishlist", "reviews", "address", "vouchers", "security", "notifications"
  ];
  return allowed.includes(value as TabId) ? (value as TabId) : "overview";
}

export function useProfilePage() {
  const { user, isLoading } = useAuth();
  const {
    orders,
    wishlist,
    vouchers,
    notifications,
    removeWishlistItem,
    markNotificationRead,
    updatePassword,
  } = useProfileData();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeTab = useMemo(() => toTab(searchParams.get("tab")), [searchParams]);

  const setActiveTab = useCallback((tab: TabId) => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?redirect=/profile");
    }
  }, [isLoading, user, router]);

  const handleSavePassword = (payload: { currentPassword: string; newPassword: string }) => {
    const result = updatePassword({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.newPassword,
    });
    return result.success;
  };

  return {
    state: {
      user,
      isLoading,
      orders,
      wishlist,
      vouchers,
      notifications,
      activeTab
    },
    actions: {
      setActiveTab,
      removeWishlistItem,
      markNotificationRead,
      handleSavePassword
    }
  };
}

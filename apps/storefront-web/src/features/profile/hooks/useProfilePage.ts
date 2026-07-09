import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  
  const [localTab, setLocalTab] = useState<TabId | null>(null);
  const activeTab = localTab ?? toTab(searchParams.get("tab"));

  const setActiveTab = useCallback((tab: TabId) => {
    setLocalTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

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

  const hasActiveTab = !!localTab || !!searchParams.get("tab");

  return {
    state: {
      user,
      isLoading,
      orders,
      wishlist,
      vouchers,
      notifications,
      activeTab,
      hasActiveTab
    },
    actions: {
      setActiveTab,
      removeWishlistItem,
      markNotificationRead,
      handleSavePassword
    }
  };
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProfileData, type ProfileAddress } from "@/context/ProfileDataContext";
import ProfileHero from "./ProfileHero";
import ProfileInfoCard from "./ProfileInfoCard";
import ProfileOrderHistory from "./ProfileOrderHistory";
import ProfileLogoutButton from "./ProfileLogoutButton";
import { 
  ProfileAddressView, 
  ProfileWishlistView,
  ProfilePaymentView, 
  ProfileVoucherView,
  ProfileNotificationView,
  ProfileSecurityView, 
  ProfileEmptyView 
} from "./ProfileViews";

type TabId = "overview" | "orders" | "wishlist" | "reviews" | "address" | "payment" | "vouchers" | "security" | "notifications";

function toTab(value: string | null): TabId {
  const allowed: TabId[] = [
    "overview", "orders", "wishlist", "reviews", "address", "payment", "vouchers", "security", "notifications"
  ];
  return allowed.includes(value as TabId) ? (value as TabId) : "overview";
}

export default function ProfilePage() {
  const { user, isLoading, updateUser } = useAuth();
  const {
    addresses,
    paymentMethods,
    orders,
    wishlist,
    vouchers,
    notifications,
    addAddress,
    removeAddress,
    addPaymentMethod,
    removePaymentMethod,
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

  if (isLoading || !user) {
    return (
      <div className="pv-loading-wrap">
        <div className="animate-spin pv-loading-spinner"></div>
      </div>
    );
  }

  const handleSaveAddress = async (payload: Omit<ProfileAddress, "id" | "isPrimary">) => {
    await addAddress(payload);
    updateUser({ address: `${payload.line1}, ${payload.city}` });
  };

  const handleSavePayment = async (payload: { label: string; accountNumber: string; accountName: string }) => {
    await addPaymentMethod(payload);
    updateUser({ paymentPreference: payload.label });
  };

  const handleSavePassword = (payload: Record<string, string>) => {
    const result = updatePassword({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.newPassword,
    });
    return result.success;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <ProfileInfoCard key={user?.id} />;
      case "orders": return <ProfileOrderHistory orders={orders} />;
      case "address":
        return (
          <ProfileAddressView
            addresses={addresses}
            onSaveAddress={handleSaveAddress}
            onRemoveAddress={removeAddress}
          />
        );
      case "payment":
        return (
          <ProfilePaymentView
            paymentMethods={paymentMethods}
            onSavePayment={handleSavePayment}
            onRemovePayment={removePaymentMethod}
          />
        );
      case "security": return <ProfileSecurityView onSavePassword={handleSavePassword} />;
      case "wishlist":
        return (
          <ProfileWishlistView
            items={wishlist}
            onRemove={removeWishlistItem}
          />
        );
      case "reviews": return <ProfileEmptyView title="Ulasan Saya" message="Anda belum memberikan ulasan produk." />;
      case "vouchers": return <ProfileVoucherView vouchers={vouchers} />;
      case "notifications":
        return (
          <ProfileNotificationView
            notifications={notifications}
            onMarkRead={markNotificationRead}
          />
        );
      default: return null;
    }
  };

  return (
    <main className="profile-page">
      <ProfileHero user={user} />
      <div className="profile-dashboard">
        <aside className="profile-sidebar">
          <div className="profile-section-title mb-3">Akun</div>
          <nav className="profile-sidebar-nav mb-8">
            <button className={`profile-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Profil Saya</button>
            <button className={`profile-tab ${activeTab === "address" ? "active" : ""}`} onClick={() => setActiveTab("address")}>Alamat Pengiriman</button>
            <button className={`profile-tab ${activeTab === "payment" ? "active" : ""}`} onClick={() => setActiveTab("payment")}>Metode Pembayaran</button>
            <button className={`profile-tab ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>Keamanan</button>
          </nav>

          <div className="profile-section-title mb-3">Aktivitas</div>
          <nav className="profile-sidebar-nav mb-8">
            <button className={`profile-tab ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>Pesanan Saya</button>
            <button className={`profile-tab ${activeTab === "wishlist" ? "active" : ""}`} onClick={() => setActiveTab("wishlist")}>Daftar Keinginan</button>
          </nav>

          <div className="profile-section-title mb-3">Promo & Info</div>
          <nav className="profile-sidebar-nav">
            <button className={`profile-tab ${activeTab === "vouchers" ? "active" : ""}`} onClick={() => setActiveTab("vouchers")}>Voucher Saya</button>
            <button className={`profile-tab ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>Notifikasi</button>
          </nav>

          <div className="mt-12">
            <ProfileLogoutButton />
          </div>
        </aside>

        <div className="profile-content">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}

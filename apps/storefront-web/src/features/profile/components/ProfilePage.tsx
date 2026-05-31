"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  ShoppingBag, 
  Heart, 
  Ticket, 
  Bell, 
  ChevronRight, 
  ArrowLeft 
} from "lucide-react";
import ProfileHero from "./ProfileHero";
import ProfileInfoCard from "./ProfileInfoCard";
import ProfileOrderHistory from "./ProfileOrderHistory";
import ProfileLogoutButton from "./ProfileLogoutButton";
import { AddressManager } from "./AddressManager";
import { 
  ProfileWishlistView,
  ProfileVoucherView,
  ProfileNotificationView,
  ProfileSecurityView, 
  ProfileEmptyView 
} from "./ProfileViews";
import { useProfilePage } from "../hooks/useProfilePage";

export default function ProfilePage() {
  const { state, actions } = useProfilePage();
  const { user, isLoading, orders, wishlist, vouchers, notifications, activeTab } = state;
  const { setActiveTab, removeWishlistItem, markNotificationRead, handleSavePassword } = actions;
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTabParam = searchParams.get("tab");
  const hasActiveTab = !!activeTabParam;

  if (isLoading || !user) {
    return (
      <div className="pv-loading-wrap">
        <div className="animate-spin pv-loading-spinner"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <ProfileInfoCard key={user?.id} />;
      case "orders": return <ProfileOrderHistory orders={orders} />;
      case "address":
        return <AddressManager />;

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

          <div className="profile-desktop-logout mt-12">
            <ProfileLogoutButton />
          </div>
        </aside>

        {/* Mobile Vertical Settings-like Menu (visible when no tab is selected) */}
        {!hasActiveTab && (
          <div className="profile-mobile-menu">
            <div className="profile-mobile-menu-section">
              <h3 className="profile-mobile-section-title">Akun</h3>
              <div className="profile-mobile-menu-card">
                <button className="profile-mobile-menu-item" onClick={() => setActiveTab("overview")}>
                  <div className="profile-mobile-menu-item-left">
                    <User size={18} className="profile-menu-icon" />
                    <span>Profil Saya</span>
                  </div>
                  <ChevronRight size={16} className="profile-menu-chevron" />
                </button>
                <button className="profile-mobile-menu-item" onClick={() => setActiveTab("address")}>
                  <div className="profile-mobile-menu-item-left">
                    <MapPin size={18} className="profile-menu-icon" />
                    <span>Alamat Pengiriman</span>
                  </div>
                  <ChevronRight size={16} className="profile-menu-chevron" />
                </button>
                <button className="profile-mobile-menu-item" onClick={() => setActiveTab("security")}>
                  <div className="profile-mobile-menu-item-left">
                    <ShieldCheck size={18} className="profile-menu-icon" />
                    <span>Keamanan</span>
                  </div>
                  <ChevronRight size={16} className="profile-menu-chevron" />
                </button>
              </div>
            </div>

            <div className="profile-mobile-menu-section">
              <h3 className="profile-mobile-section-title">Aktivitas</h3>
              <div className="profile-mobile-menu-card">
                <button className="profile-mobile-menu-item" onClick={() => setActiveTab("orders")}>
                  <div className="profile-mobile-menu-item-left">
                    <ShoppingBag size={18} className="profile-menu-icon" />
                    <span>Pesanan Saya</span>
                  </div>
                  <ChevronRight size={16} className="profile-menu-chevron" />
                </button>
                <button className="profile-mobile-menu-item" onClick={() => setActiveTab("wishlist")}>
                  <div className="profile-mobile-menu-item-left">
                    <Heart size={18} className="profile-menu-icon" />
                    <span>Daftar Keinginan</span>
                  </div>
                  <ChevronRight size={16} className="profile-menu-chevron" />
                </button>
              </div>
            </div>

            <div className="profile-mobile-menu-section">
              <h3 className="profile-mobile-section-title">Promo & Info</h3>
              <div className="profile-mobile-menu-card">
                <button className="profile-mobile-menu-item" onClick={() => setActiveTab("vouchers")}>
                  <div className="profile-mobile-menu-item-left">
                    <Ticket size={18} className="profile-menu-icon" />
                    <span>Voucher Saya</span>
                  </div>
                  <ChevronRight size={16} className="profile-menu-chevron" />
                </button>
                <button className="profile-mobile-menu-item" onClick={() => setActiveTab("notifications")}>
                  <div className="profile-mobile-menu-item-left">
                    <Bell size={18} className="profile-menu-icon" />
                    <span>Notifikasi</span>
                  </div>
                  <ChevronRight size={16} className="profile-menu-chevron" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content area: active tab content (on mobile, visible only when a tab is selected) */}
        <div className={`profile-content ${hasActiveTab ? "mobile-visible" : "mobile-hidden"}`}>
          {hasActiveTab && (
            <button className="profile-back-button" onClick={() => router.push("/profile")}>
              <ArrowLeft size={16} />
              <span>Kembali ke Menu Utama</span>
            </button>
          )}
          {renderContent()}
        </div>

        {/* Mobile Logout Button: visible only on the main menu screen */}
        {!hasActiveTab && (
          <div className="profile-mobile-logout">
            <ProfileLogoutButton />
          </div>
        )}
      </div>
    </main>
  );
}

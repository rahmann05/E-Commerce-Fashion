"use client";

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

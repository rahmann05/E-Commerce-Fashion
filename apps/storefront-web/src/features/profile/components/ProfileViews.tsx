"use client";

import { useState, type FormEvent } from "react";
import type {
  ProfileNotification,
  ProfileVoucher,
  WishlistItem,
} from "@/core/providers/ProfileDataContext";
import { useProfileSecurity } from "../hooks/useProfileSecurity";

function formatPrice(price: number): string {
  const finalPrice = price < 10000 ? price * 1000 : price;
  return finalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function ProfileSecurityView({
  onSavePassword,
}: {
  onSavePassword: (payload: { currentPassword: string; newPassword: string }) => boolean;
}) {
  const { state, actions } = useProfileSecurity(onSavePassword);
  const { currentPassword, newPassword, confirmPassword, message } = state;
  const { setCurrentPassword, setNewPassword, setConfirmPassword, handleSave } = actions;

  return (
    <section>
      <p className="profile-section-title">Ubah Password</p>
      <form onSubmit={handleSave} className="pv-content-400">
        <div className="auth-input-wrapper">
          <label htmlFor="security-current-password" className="auth-input-label">Password Saat Ini</label>
          <input
            id="security-current-password"
            type="password"
            className="auth-input"
            placeholder="••••••••"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="auth-input-wrapper">
          <label htmlFor="security-new-password" className="auth-input-label">Password Baru</label>
          <input
            id="security-new-password"
            type="password"
            className="auth-input"
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="auth-input-wrapper">
          <label htmlFor="security-confirm-password" className="auth-input-label">Konfirmasi Password Baru</label>
          <input
            id="security-confirm-password"
            type="password"
            className="auth-input"
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button 
          type="submit"
          className="pill-btn pv-btn-primary pv-mt-16"
        >
          Perbarui Password
        </button>
        {message && (
          <p className="pv-help-text">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

export function ProfileWishlistView({
  items,
  onRemove,
}: {
  items: WishlistItem[];
  onRemove: (productId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <ProfileEmptyView
        title="Daftar Keinginan"
        message="Belum ada produk di wishlist Anda."
      />
    );
  }

  return (
    <section>
      <p className="profile-section-title">Daftar Keinginan</p>
      <div className="pv-content-640">
        {items.map((item) => (
          <div
            key={item.productId}
            className="pv-line-row"
          >
            <div>
              <div className="pv-line-title">{item.name}</div>
              <div className="pv-line-subtitle">
                {item.category} · Rp {formatPrice(item.price)}
              </div>
            </div>
            <button type="button" className="pill-btn" onClick={() => onRemove(item.productId)}>
              Hapus
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProfileVoucherView({ vouchers }: { vouchers: ProfileVoucher[] }) {
  if (vouchers.length === 0) {
    return (
      <ProfileEmptyView
        title="Voucher Saya"
        message="Tidak ada voucher yang tersedia saat ini."
      />
    );
  }
  return (
    <section>
      <p className="profile-section-title">Voucher Saya</p>
      {vouchers.map((voucher) => (
        <div
          key={voucher.id}
          className="pv-note-line"
        >
          <div className="pv-note-title">{voucher.title}</div>
          <div className="pv-note-subtitle">
            {voucher.code} · Berlaku sampai {voucher.expiresAt}
          </div>
        </div>
      ))}
    </section>
  );
}

export function ProfileNotificationView({
  notifications,
  onMarkRead,
}: {
  notifications: ProfileNotification[];
  onMarkRead: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <ProfileEmptyView
        title="Notifikasi"
        message="Tidak ada notifikasi baru."
      />
    );
  }
  return (
    <section>
      <p className="profile-section-title">Notifikasi</p>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="pv-note-line"
        >
          <div className="pv-note-row">
            <div>
              <div className="pv-note-title">{notification.title}</div>
              <div className="pv-note-subtitle">{notification.message}</div>
            </div>
            {!notification.isRead && (
              <button type="button" className="pill-btn" onClick={() => onMarkRead(notification.id)}>
                Tandai Dibaca
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

export function ProfileEmptyView({ title, message }: { title: string; message: string }) {
  return (
    <section>
      <p className="profile-section-title">{title}</p>
      <div className="pv-empty-block">
        <p className="pv-empty-message">{message}</p>
      </div>
    </section>
  );
}

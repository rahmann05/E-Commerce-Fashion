"use client";

import { useState, type FormEvent } from "react";
import type {
  ProfileNotification,
  ProfilePaymentMethod,
  ProfileVoucher,
  WishlistItem,
} from "@/core/providers/ProfileDataContext";

function formatPrice(price: number): string {
  const finalPrice = price < 10000 ? price * 1000 : price;
  return finalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function ProfilePaymentView({
  paymentMethods,
  onSavePayment,
  onRemovePayment,
}: {
  paymentMethods: ProfilePaymentMethod[];
  onSavePayment: (payload: { label: string; accountNumber: string; accountName: string }) => Promise<{ success: boolean; message?: string }>;
  onRemovePayment: (id: string) => void;
}) {
  const [formData, setFormData] = useState({
    label: "BCA",
    accountNumber: "",
    accountName: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!formData.accountNumber || !formData.accountName) {
      setErrorMsg("Mohon lengkapi nomor rekening dan nama pemilik.");
      return;
    }
    setErrorMsg(null);
    setIsSaving(true);
    try {
      await onSavePayment(formData);
      setShowForm(false);
      setFormData({ label: "BCA", accountNumber: "", accountName: "" });
    } catch {
      setErrorMsg("Gagal menyimpan metode pembayaran.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <div className="pv-section-header">
        <p className="profile-section-title pv-title-inline">Metode Pembayaran</p>
        <button 
          className="pill-btn pv-btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setErrorMsg(null);
          }}
        >
          {showForm ? "Batal" : "Tambah Rekening"}
        </button>
      </div>

      <div className="pv-content-600">
        {showForm && (
          <div className="pv-form-panel">
            <div className="auth-input-wrapper">
              <label htmlFor="payment-bank" className="auth-input-label">Pilih Bank</label>
              <select id="payment-bank" className="auth-input" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})}>
                <option value="BCA">BCA (Bank Central Asia)</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BNI">BNI (Bank Negara Indonesia)</option>
                <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                <option value="SeaBank">SeaBank</option>
                <option value="DANA">DANA (E-Wallet)</option>
              </select>
            </div>
            
            <div className="auth-input-wrapper">
              <label htmlFor="payment-account" className="auth-input-label">Nomor Rekening / HP</label>
              <input id="payment-account" className="auth-input" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} placeholder="Masukkan nomor..." />
            </div>

            <div className="auth-input-wrapper">
              <label htmlFor="payment-name" className="auth-input-label">Nama Lengkap Pemilik</label>
              <input id="payment-name" className="auth-input" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} placeholder="Sesuai buku tabungan" />
            </div>

            {errorMsg && (
              <div className="pv-form-message error mb-4">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              className="pill-btn pv-btn-primary pv-btn-block pv-mt-16"
              disabled={isSaving}
              onClick={handleAdd}
            >
              {isSaving ? "Menyimpan..." : "Simpan Rekening"}
            </button>
          </div>
        )}

        <div className="payment-list">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="pv-item-card pv-item-card-center"
            >
              <div className="pv-payment-meta">
                <div className="pv-payment-head">
                  {method.label} {method.isPrimary && <span className="pv-badge-payment-primary">UTAMA</span>}
                </div>
                <div className="pv-payment-number">{method.accountNumber}</div>
                <div className="pv-payment-owner">an. {method.accountName}</div>
              </div>
              <button
                type="button"
                className="pill-btn pv-btn-xs"
                onClick={() => onRemovePayment(method.id)}
              >
                Hapus
              </button>
            </div>
          ))}
          {paymentMethods.length === 0 && !showForm && (
            <div className="pv-empty-line">Belum ada metode pembayaran.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ProfileSecurityView({
  onSavePassword,
}: {
  onSavePassword: (payload: { currentPassword: string; newPassword: string }) => boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Konfirmasi password tidak cocok.");
      return;
    }

    const success = onSavePassword({ currentPassword, newPassword });
    setMessage(
      success
        ? "Password berhasil diperbarui (simulasi frontend)."
        : "Password saat ini tidak valid."
    );
    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

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

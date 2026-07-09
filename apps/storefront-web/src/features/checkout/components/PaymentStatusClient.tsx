"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Clock, ArrowLeft, RefreshCw, CreditCard } from "lucide-react";

import { getImageUrl } from "@/shared/utils/image-utils";
import "@/shared/styles/payment-status-detail.css";
import { usePaymentStatus } from "../hooks/usePaymentStatus";

export function PaymentStatusClient() {
  const { state, actions } = usePaymentStatus();
  const {
    status,
    loading,
    error,
    copied,
    localOrder,
    paymentDetails,
    qrAction,
    orderId,
    user
  } = state;
  const { handleCopy, fetchStatus, initiateCharge } = actions;
  const formatPrice = (price: string | number | undefined | null) => {
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    if (numericPrice === undefined || numericPrice === null || isNaN(numericPrice)) return "Rp0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  if (loading) {
    return (
      <div className="payment-status-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <RefreshCw className="animate-spin" size={48} color="#111" style={{ margin: "0 auto 1.5rem", opacity: 0.2 }} />
          <p>Memuat status pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="payment-status-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="payment-container" style={{ textAlign: "center" }}>
          <h1 style={{ color: "#ef4444", fontSize: "1.5rem", marginBottom: "1rem" }}>Oops!</h1>
          <p style={{ color: "#666", marginBottom: "2rem" }}>{error}</p>
          <div className="payment-actions">
            <Link href="/profile?tab=orders" className="btn-primary">
              Kembali ke Pesanan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSettled = status?.transaction_status === "settlement" || status?.transaction_status === "capture";
  const isPending = status?.transaction_status === "pending" || (!status?.transaction_status && status?.method === "snap");
  const isFailed = ["deny", "cancel", "expire"].includes(status?.transaction_status || "");

  const getStatusLabel = () => {
    if (isSettled) return "Pembayaran Berhasil";
    if (isPending) return "Selesaikan Pembayaran";
    if (isFailed) return "Pembayaran Gagal";
    return "Status Pembayaran";
  };

  return (
    <>
      <main className="payment-status-page">
        <div className="payment-container">
          <div className="payment-header">
            {isSettled ? (
              <CheckCircle2 size={64} color="#10b981" style={{ margin: "0 auto 1.5rem" }} />
            ) : isFailed ? (
              <ArrowLeft size={64} color="#ef4444" style={{ margin: "0 auto 1.5rem" }} />
            ) : isPending ? (
              <Clock size={64} color="#f59e0b" style={{ margin: "0 auto 1.5rem" }} />
            ) : (
              <CreditCard size={64} color="#111" style={{ margin: "0 auto 1.5rem", opacity: 0.1 }} />
            )}
            <h1>{getStatusLabel()}</h1>
            <p>Order ID: {status?.order_id || orderId}</p>
          </div>

          <div className="payment-amount-card">
            <div className="payment-amount-label">Total Pembayaran</div>
            <div className="payment-amount-value">{formatPrice(status?.gross_amount || localOrder?.total)}</div>
          </div>

          {status && (
            <div className="payment-details">
              <div className="detail-row">
                <span className="detail-label">Metode Pembayaran</span>
                <span className="detail-value">{paymentDetails?.methodLabel}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`status-badge status-${status.transaction_status}`}>{isPending ? "MENUNGGU" : status.transaction_status?.toUpperCase() || "MEMPROSES"}</span>
              </div>
              {status.expiry_time && isPending && (
                <div className="detail-row">
                  <span className="detail-label">Batas Waktu</span>
                  <span className="detail-value" style={{ color: "#ef4444", fontWeight: "600" }}>
                    {status.expiry_time}
                  </span>
                </div>
              )}
            </div>
          )}

          {localOrder && (
            <div className="payment-address-section">
              <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>Rincian Pesanan</h3>
              <div className="payment-products-list" style={{ marginBottom: "2rem" }}>
                {localOrder.items.map((item) => {
                  const productImg = getImageUrl(item.imageUrl || item.product?.imageUrl || item.product?.image?.[0] || item.product?.images?.[0]) || '/images/about/model1.png';
                  
                  // Helper to map hex codes to readable color names
                  const formatColor = (color: string) => {
                    if (!color) return color;
                    if (!color.startsWith('#')) return color;
                    const c = color.toLowerCase();
                    if (c === '#fafafa' || c === '#ffffff' || c === '#fff') return 'White';
                    if (c === '#111111' || c === '#000000' || c === '#000' || c === '#111') return 'Black';
                    if (c === '#4b5563') return 'Gray';
                    if (c === '#3b82f6') return 'Blue';
                    return color;
                  };
                  
                  return (
                    <div key={item.productId} style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid #f9f9f9" }}>
                      <div style={{ width: 48, height: 56, borderRadius: 4, overflow: "hidden", position: "relative", backgroundColor: "#f5f5f5" }}>
                        {productImg ? (
                          <Image src={productImg} alt={item.name} width={48} height={56} style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem" }}>No Image</div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.2rem" }}>{item.name}</p>
                        <p style={{ fontSize: "0.75rem", color: "#666" }}>{[item.size, formatColor(item.color), `${item.quantity}x`].filter(Boolean).join(' · ')}</p>
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {formatPrice(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3>Alamat Pengiriman</h3>
              <div className="payment-address-card">
                <div style={{ fontWeight: "700", marginBottom: "0.4rem" }}>
                  {localOrder.address?.recipient || user?.name} | {localOrder.address?.phone || user?.phone || "-"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.5 }}>
                   {localOrder.address?.line1 || "No address provided"}
                </div>
              </div>
            </div>
          )}

          {isPending && (
            <div style={{ marginTop: "1rem" }}>
              {status.method === "snap" && status.redirect_url && (
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <p style={{ fontSize: "0.85rem", marginBottom: "1rem", color: "#666" }}>Pembayaran diproses melalui Snap. Klik tombol di bawah jika jendela tidak terbuka.</p>
                  <a href={status.redirect_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "inline-block" }}>
                    Bayar Sekarang
                  </a>
                </div>
              )}

              {paymentDetails?.vaNumber && (
                <div className="va-container">
                  <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>Nomor Virtual Account</span>
                  <span className="va-number">{paymentDetails.vaNumber}</span>
                  <button className="copy-btn" onClick={() => handleCopy(paymentDetails.vaNumber)}>
                    {copied ? "Berhasil Disalin" : "Salin Nomor"}
                  </button>
                </div>
              )}

              {qrAction && (
                <div className="qris-container">
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.85rem", marginBottom: "1rem", color: "#666" }}>Scan kode QR di bawah ini</p>
                    <Image src={qrAction.url} alt="QRIS Code" width={200} height={200} className="qris-img" unoptimized />
                  </div>
                </div>
              )}

              <div className="instructions-card">
                <h3>Cara Pembayaran</h3>
                <ul className="instructions-list">
                  <li>1. Buka aplikasi Mobile Banking atau ATM anda.</li>
                  <li>
                    2. Pilih menu <span>Transfer / Pembayaran</span>.
                  </li>
                  <li>3. Masukkan nomor Virtual Account / Scan QRIS di atas.</li>
                  <li>4. Pastikan jumlah nominal sudah sesuai.</li>
                  <li>5. Simpan bukti transaksi anda.</li>
                </ul>
              </div>
            </div>
          )}

          <div className="payment-actions">
            {isPending ? (
              <>
                <button onClick={() => fetchStatus(true)} className="btn-primary" disabled={loading}>
                  {loading ? "Mengecek..." : "Saya Sudah Bayar"}
                </button>
                <Link href="/profile?tab=orders" className="btn-secondary">
                  Kembali ke Pesanan
                </Link>
              </>
            ) : !status || (!status.transaction_status && status.method !== "snap") ? (
              <div style={{ width: "100%", marginTop: "1rem" }}>
                <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#666", marginBottom: "1.5rem" }}>Pilih metode pembayaran untuk melanjutkan</p>
                <div className="payment-options-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button onClick={() => initiateCharge("bca_va")} className="btn-method">
                    BCA Virtual Account
                  </button>
                  <button onClick={() => initiateCharge("bni_va")} className="btn-method">
                    BNI Virtual Account
                  </button>
                  <button onClick={() => initiateCharge("bri_va")} className="btn-method">
                    BRI Virtual Account
                  </button>
                  <button onClick={() => initiateCharge("mandiri_va")} className="btn-method">
                    Mandiri Bill
                  </button>
                  <button onClick={() => initiateCharge("qris")} className="btn-method">
                    QRIS / E-Wallet
                  </button>
                  <button onClick={() => initiateCharge("gopay")} className="btn-method">
                    GoPay
                  </button>
                  <button onClick={() => initiateCharge("alfamart")} className="btn-method" style={{ gridColumn: "span 2" }}>
                    Alfamart / Indomaret
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/profile?tab=orders" className="btn-primary">
                Kembali ke Profil
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STANDARD_PAYMENTS, normalizePrice, formatPrice, mapPaymentMethodToMidtransKey } from "../utils";
import { MapPin, CreditCard, Truck } from "lucide-react";
import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import { getImageUrl } from "@/shared/utils/image-utils";
import "@/shared/styles/payment.css";
import { useCheckout } from "../hooks/useCheckout";

interface CourierOption {
  id: string;
  label: string;
  fee: number;
}

import dynamic from "next/dynamic";

const LocationMap = dynamic<{
  onLocationSelect: (address: string, lat: number, lng: number, rawAddr: Record<string, unknown>, postalCode: string) => void;
  centerLat?: number | null;
  centerLng?: number | null;
}>(() => import("@/features/checkout/components/LocationMap"), { ssr: false });



export function CheckoutClient() {
  const { state, actions } = useCheckout();
  const {
    items,
    cartLoading,
    addresses,
    effectiveAddressId,
    effectivePaymentId,
    couriers,
    selectedCourierId,
    selectedCourier,
    notes,
    promoCode,
    isSubmitting,
    error,
    showAddressForm,
    isSavingAddress,
    addressFormData,
    subtotal,
    shipping,
    total,
    selectedAddressId,
    selectedPaymentId
  } = state;

  const {
    setSelectedAddressId,
    setSelectedPaymentId,
    setSelectedCourierId,
    setNotes,
    setPromoCode,
    setShowAddressForm,
    setAddressFormData,
    handleLocationSelect,
    handleSaveNewAddress,
    handleSubmit,
    setError
  } = actions;

  return (
    <>
      <Navbar />
      <main className="checkout-page">
        <div className="checkout-wrap">
          <section className="checkout-main">
            <header className="checkout-header">
              <p className="checkout-label">Checkout</p>
              <h1>Konfirmasi Pesanan</h1>
            </header>

            <article className="checkout-card address-card">
              <div className="checkout-card-header">
                <div className="checkout-header-main">
                  <MapPin size={18} />
                  <h2>Alamat Pengiriman</h2>
                </div>
                {!showAddressForm && (
                  <button className="checkout-header-action" onClick={() => setShowAddressForm(true)}>
                    + Alamat Baru
                  </button>
                )}
              </div>

              {addresses.length === 0 && !showAddressForm ? (
                <div className="checkout-address-content">
                  <div className="checkout-address-text">Belum ada alamat pengiriman.</div>
                </div>
              ) : (
                <div className="checkout-address-list">
                  {showAddressForm && (
                    <div className="checkout-inline-form">
                      <div className="checkout-form-header">
                        <h3>Alamat Baru</h3>
                        <button className="checkout-close-btn" onClick={() => setShowAddressForm(false)}>Batal</button>
                      </div>
                      
                      <div className="checkout-map-wrap">
                        <LocationMap 
                          onLocationSelect={handleLocationSelect} 
                          centerLat={addressFormData.latitude} 
                          centerLng={addressFormData.longitude} 
                        />
                      </div>

                      <div className="checkout-form-grid">
                        <div className="checkout-input-group">
                          <label>Nama Penerima</label>
                          <input className="checkout-input" value={addressFormData.recipient} onChange={e => setAddressFormData({...addressFormData, recipient: e.target.value})} placeholder="Alex Doe" />
                        </div>
                        <div className="checkout-input-group">
                          <label>Nomor Telepon</label>
                          <input className="checkout-input" value={addressFormData.phone} onChange={e => setAddressFormData({...addressFormData, phone: e.target.value})} placeholder="0812xxx" />
                        </div>
                      </div>

                      <div className="checkout-input-group checkout-input-group-spaced">
                        <label>Alamat Lengkap</label>
                        <input className="checkout-input" value={addressFormData.line1} onChange={e => setAddressFormData({...addressFormData, line1: e.target.value})} placeholder="Nama jalan, nomor rumah, dsb." />
                      </div>

                      <div className="checkout-form-grid checkout-input-group-spaced">
                        <div className="checkout-input-group">
                          <label>Provinsi</label>
                          <input className="checkout-input" value={addressFormData.province} onChange={e => setAddressFormData({...addressFormData, province: e.target.value})} placeholder="Provinsi" />
                        </div>
                        <div className="checkout-input-group">
                          <label>Kota/Kabupaten</label>
                          <input className="checkout-input" value={addressFormData.city} onChange={e => setAddressFormData({...addressFormData, city: e.target.value})} placeholder="Kota" />
                        </div>
                      </div>

                      <button 
                        className="checkout-submit checkout-submit-spaced" 
                        onClick={handleSaveNewAddress}
                        disabled={isSavingAddress}
                      >
                        {isSavingAddress ? "Menyimpan..." : "Simpan & Gunakan Alamat"}
                      </button>
                    </div>
                  )}

                  {!showAddressForm && addresses.map((address) => (
                    <label key={address.id} className="checkout-option">
                      <input
                        type="radio"
                        name="address"
                        checked={effectiveAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                      <div>
                        <strong>
                          {address.label} - {address.recipient}
                          {address.isPrimary ? <span className="checkout-address-badge">Primary</span> : null}
                        </strong>
                        <p>
                          {address.line1}, {address.district}, {address.city}, {address.province}, {address.postalCode}
                        </p>
                        <p>{address.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </article>

            <article className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-header-main">
                  <Truck size={18} />
                  <h2>Kurir Pengiriman</h2>
                </div>
              </div>

              <div className="checkout-options">
                {couriers.map((courier) => (
                  <label key={courier.id} className="checkout-option">
                    <input
                      type="radio"
                      name="courier"
                      checked={selectedCourierId === courier.id}
                      onChange={() => setSelectedCourierId(courier.id)}
                    />
                    <div>
                      <strong>{courier.label}</strong>
                      <p>{formatPrice(courier.fee)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </article>

            <article className="checkout-card animate-fade-in">
              <div className="checkout-card-header">
                <div className="checkout-header-main">
                  <CreditCard size={18} />
                  <h2>Metode Pembayaran</h2>
                </div>
              </div>

              <div className="checkout-payment-sections" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 0.5rem' }}>
                <div className="checkout-payment-group">
                  <p className="checkout-sub-label" style={{ fontWeight: 600, color: "#444", marginBottom: "0.75rem", fontSize: "0.9rem" }}>Metode Pembayaran Instan / Virtual Account</p>
                  <div className="checkout-options" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
                    {STANDARD_PAYMENTS.map((method) => {
                      const isSelected = effectivePaymentId === method.id;
                      return (
                        <label key={method.id} className={`checkout-option ${isSelected ? 'selected' : ''}`} style={{
                          border: isSelected ? '2px solid #000' : '1px solid #e2e8f0',
                          padding: '1rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'flex-start',
                          backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none'
                        }}>
                          <input
                            type="radio"
                            name="payment"
                            checked={isSelected}
                            onChange={() => setSelectedPaymentId(method.id)}
                            style={{ marginTop: '0.2rem', accentColor: '#000' }}
                          />
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1a202c' }}>{method.label}</strong>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>{method.details}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>

            <article className="checkout-card checkout-products">
              <div className="checkout-product-header">
                <span>Produk</span>
                <span className="checkout-col-center">Qty</span>
                <span className="checkout-col-center">Harga</span>
                <span className="checkout-col-right">Subtotal</span>
              </div>

              {items.length === 0 ? (
                <p className="checkout-address-text">Keranjang kosong.</p>
              ) : (
                items.map((item) => {
                  const unit = normalizePrice(item.product?.price || 0);
                  const productImg = getImageUrl(item.product?.imageUrl || item.product?.image?.[0] || item.product?.images?.[0]);
                  
                  return (
                    <div key={item.id} className="checkout-product-row">
                      <div className="checkout-product-info">
                        <div className="checkout-product-img-wrap">
                          {productImg ? (
                            <Image
                              src={productImg}
                              alt={item.product?.name || "Produk"}
                              fill
                              className="checkout-product-img"
                            />
                          ) : (
                             <div className="checkout-product-img-placeholder" />
                          )}
                        </div>
                        <div className="checkout-product-meta">
                          <p>{item.product?.name || "Loading..."}</p>
                          <p className="variant">
                            {item.variant?.size || "All Size"} · {item.variant?.color || "Default"}
                          </p>
                        </div>
                      </div>
                      <div className="checkout-col-center">{item.quantity}</div>
                      <div className="checkout-col-center">{formatPrice(unit)}</div>
                      <div className="checkout-col-right">{formatPrice(unit * item.quantity)}</div>
                    </div>
                  );
                })
              )}
            </article>

            <article className="checkout-card">
              <div className="checkout-input-group">
                <label htmlFor="promoCode">Kode Promo</label>
                <input
                  id="promoCode"
                  className="checkout-input"
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Masukkan kode voucher (opsional)"
                />
              </div>

              <div className="checkout-input-group checkout-input-group-spaced">
                <label htmlFor="notes">Catatan Pesanan</label>
                <textarea
                  id="notes"
                  className="checkout-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk pesanan Anda (opsional)"
                />
              </div>
            </article>
          </section>

          <aside className="checkout-summary">
            <h2>Ringkasan</h2>
            <div className="checkout-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="checkout-row">
              <span>Pengiriman</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div className="checkout-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {error ? (
              <p className="checkout-error-text">{error}</p>
            ) : null}

            <button
              className="checkout-submit"
              type="button"
              onClick={handleSubmit}
              disabled={
                cartLoading ||
                isSubmitting ||
                items.length === 0 ||
                !effectiveAddressId ||
                !effectivePaymentId ||
                !selectedCourier
              }
            >
              {isSubmitting ? "Memproses..." : "Buat Pesanan"}
            </button>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

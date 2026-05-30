import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/core/providers/CartContext";
import { useAuth } from "@/core/providers/AuthContext";
import { useProfileData } from "@/core/providers/ProfileDataContext";
import { shippingApi } from "@/shared/api/shipping";
import { STANDARD_PAYMENTS, normalizePrice, mapPaymentMethodToMidtransKey } from "../utils";

export interface CourierOption {
  id: string;
  label: string;
  fee: number;
}

export function useCheckout() {
  const router = useRouter();
  const { items, isLoading: cartLoading, clearCart } = useCart();
  const { user } = useAuth();
  const { addresses, submitCheckout, addAddress } = useProfileData();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    label: "Rumah",
    recipient: "",
    phone: "",
    line1: "",
    district: "",
    city: "",
    province: "",
    postalCode: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  useEffect(() => {
    if (!user) {
      router.replace("/login?redirect=/catalogue/cart/pembayaran");
    }
  }, [router, user]);

  const effectiveAddressId = useMemo(() => {
    if (selectedAddressId) return selectedAddressId;
    const primary = addresses.find((a) => a.isPrimary) || addresses[0];
    return primary?.id || "";
  }, [addresses, selectedAddressId]);

  const effectivePaymentId = useMemo(() => {
    if (selectedPaymentId) return selectedPaymentId;
    return STANDARD_PAYMENTS[0].id;
  }, [selectedPaymentId]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === effectiveAddressId),
    [addresses, effectiveAddressId]
  );

  useEffect(() => {
    let active = true;
    const loadShippingOptions = async () => {
      if (!selectedAddress) {
        setCouriers([]);
        setSelectedCourierId("");
        return;
      }

      if (typeof selectedAddress.latitude !== "number" || typeof selectedAddress.longitude !== "number") {
        const defaults: CourierOption[] = [
          { id: "jne-reg", label: "JNE Reguler (2-4 hari)", fee: 15000 },
          { id: "sicepat-best", label: "SiCepat BEST (1-2 hari)", fee: 18000 },
        ];
        if (active) {
          setCouriers(defaults);
          setSelectedCourierId(defaults[0].id);
        }
        return;
      }

      try {
        const payload = await shippingApi.calculateShipping({
          lat: selectedAddress.latitude,
          lng: selectedAddress.longitude,
          city: selectedAddress.city,
        });

        if (!payload?.success || !Array.isArray(payload.couriers)) {
          throw new Error(payload?.error || "Gagal mengambil ongkos kirim");
        }
        if (!active) return;
        setCouriers(payload.couriers as CourierOption[]);
        setSelectedCourierId((prev) => {
          if (prev && payload.couriers.some((c: CourierOption) => c.id === prev)) {
            return prev;
          }
          return payload.couriers[0]?.id || "";
        });
      } catch {
        if (!active) return;
        const fallback: CourierOption[] = [{ id: "jne-reg", label: "JNE Reguler (2-4 hari)", fee: 15000 }];
        setCouriers(fallback);
        setSelectedCourierId(fallback[0].id);
      }
    };

    void loadShippingOptions();
    return () => {
      active = false;
    };
  }, [selectedAddress]);

  const selectedCourier = useMemo(
    () => couriers.find((c) => c.id === selectedCourierId) || null,
    [couriers, selectedCourierId]
  );

  const handleLocationSelect = async (address: string, lat: number, lng: number, rawAddr: Record<string, unknown>, postalCode: string) => {
    const translateMapTerm = (s: string) => {
      if (!s) return "";
      return s
        .replace(/\bSouth\b/g, "Selatan")
        .replace(/\bNorth\b/g, "Utara")
        .replace(/\bWest\b/g, "Barat")
        .replace(/\bEast\b/g, "Timur")
        .replace(/\bCentral\b/g, "Pusat")
        .replace(/\bProvince\b/g, "Provinsi")
        .replace(/\bRegency\b/g, "Kabupaten")
        .trim();
    };

    const prov = translateMapTerm((rawAddr.state as string) || (rawAddr.region as string) || "");
    const city = translateMapTerm((rawAddr.city as string) || (rawAddr.county as string) || (rawAddr.municipality as string) || "");
    const dist = translateMapTerm((rawAddr.suburb as string) || (rawAddr.district as string) || (rawAddr.village as string) || (rawAddr.town as string) || "");

    setAddressFormData(prev => ({ 
      ...prev, 
      latitude: lat, 
      longitude: lng,
      line1: address,
      postalCode: postalCode || prev.postalCode,
      province: prov,
      city: city,
      district: dist
    }));
  };

  const handleSaveNewAddress = async () => {
    if (!addressFormData.recipient || !addressFormData.phone || !addressFormData.line1 || !addressFormData.city || !addressFormData.province) {
      setError("Mohon lengkapi semua data alamat.");
      return;
    }
    
    setError(null);
    setIsSavingAddress(true);
    try {
      const result = await addAddress(addressFormData);
      if (result.success && result.address) {
        setSelectedAddressId(result.address.id);
        setShowAddressForm(false);
        setAddressFormData({ label: "Rumah", recipient: "", phone: "", line1: "", district: "", city: "", province: "", postalCode: "", latitude: undefined, longitude: undefined });
      } else {
        setError(result.message || "Gagal menyimpan alamat.");
      }
    } catch {
      setError("Gagal menyimpan alamat baru.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + normalizePrice(item.product?.price || 0) * item.quantity, 0),
    [items]
  );

  const shipping = selectedCourier?.fee || 0;
  const total = subtotal + shipping;

  const handleSubmit = async () => {
    setError(null);

    if (items.length === 0) {
      setError("Keranjang kosong. Tambahkan produk terlebih dahulu.");
      return;
    }
    if (!effectiveAddressId) {
      setError("Pilih alamat pengiriman terlebih dahulu.");
      return;
    }
    if (!effectivePaymentId) {
      setError("Pilih metode pembayaran terlebih dahulu.");
      return;
    }
    if (!selectedCourier) {
      setError("Pilih kurir pengiriman terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitCheckout({
        items,
        shipping,
        total,
        addressId: effectiveAddressId,
        courier: selectedCourier.label,
        notes: notes.trim() || undefined,
        promoCode: promoCode.trim() || undefined,
      });

      if (!result.success || !result.orderId) {
        setError(result.message || "Checkout gagal diproses.");
        return;
      }

      const paymentMethod = STANDARD_PAYMENTS.find(sp => sp.id === effectivePaymentId);
      const methodKey = mapPaymentMethodToMidtransKey(paymentMethod?.label || "");
      
      await clearCart();
      
      router.push(`/catalogue/cart/pembayaran/status/${result.orderId}?method=${methodKey}`);
    } catch (err: unknown) {
      console.error("Checkout submission error:", err);
      setError("Gagal membuat pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
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
    },
    actions: {
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
    }
  };
}

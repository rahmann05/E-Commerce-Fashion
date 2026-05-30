"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { ProfileAddress } from "@/core/providers/ProfileDataContext";
import { fetchProvinces } from "@/shared/lib/geography";

const LocationMap = dynamic<{
  onLocationSelect: (address: string, lat: number, lng: number, rawAddr: Record<string, unknown>, postalCode: string) => void;
  centerLat?: number | null;
  centerLng?: number | null;
}>(() => import("@/features/checkout/components/LocationMap"), { ssr: false });

interface AddressFormProps {
  initialData?: ProfileAddress;
  onSubmit: (data: Omit<ProfileAddress, "id" | "isPrimary">) => Promise<void>;
  onCancel: () => void;
}

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const [formData, setFormData] = useState({
    label: initialData?.label || "Rumah",
    recipient: initialData?.recipient || "",
    phone: initialData?.phone || "",
    line1: initialData?.line1 || "",
    district: initialData?.district || "",
    city: initialData?.city || "",
    province: initialData?.province || "",
    postalCode: initialData?.postalCode || "",
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const changeSourceRef = useRef<"map" | "dropdown" | null>(null);

  useEffect(() => {
    fetchProvinces().then(setProvinces);
  }, []);

  // Auto-search coordinates when changed via dropdown (matching ProfileViews logic)
  useEffect(() => {
    if (changeSourceRef.current !== "dropdown") return;
    const query = [formData.district, formData.city, formData.province]
      .filter(Boolean)
      .join(", ");
    if (!query) return;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=1&accept-language=id`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          }));
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.district, formData.city, formData.province]);

  const handleLocationSelect = async (
    address: string,
    lat: number,
    lng: number,
    rawAddr: Record<string, unknown>,
    postalCode: string
  ) => {
    changeSourceRef.current = "map";

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
        .replace(/\bSpecial Region of\b/g, "Daerah Istimewa")
        .replace(/\bCapital City District of\b/g, "DKI")
        .trim();
    };

    const prov = translateMapTerm(
      (rawAddr.state as string) || (rawAddr.region as string) || ""
    );
    const city = translateMapTerm(
      (rawAddr.city as string) ||
        (rawAddr.county as string) ||
        (rawAddr.municipality as string) ||
        ""
    );
    const dist = translateMapTerm(
      (rawAddr.suburb as string) ||
        (rawAddr.district as string) ||
        (rawAddr.village as string) ||
        (rawAddr.town as string) ||
        ""
    );

    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      line1: address,
      postalCode: postalCode || prev.postalCode,
      province: prov || prev.province,
      city: city || prev.city,
      district: dist || prev.district,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.recipient ||
      !formData.phone ||
      !formData.line1 ||
      !formData.city ||
      !formData.province
    ) {
      setErrorMsg("Mohon lengkapi semua data alamat.");
      return;
    }

    setErrorMsg(null);
    setIsSaving(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setErrorMsg("Terjadi kesalahan saat menyimpan alamat.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pv-form-panel">
      <form onSubmit={handleSubmit}>
        <div className="pv-mb-24">
          <LocationMap
            onLocationSelect={handleLocationSelect}
            centerLat={formData.latitude}
            centerLng={formData.longitude}
          />
        </div>

        <div className="pv-grid-2">
          <div className="auth-input-wrapper">
            <label htmlFor="address-label" className="auth-input-label">Label Alamat</label>
            <input
              id="address-label"
              className="auth-input"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Rumah / Kantor / Apartemen"
            />
          </div>
          <div className="auth-input-wrapper">
            <label htmlFor="address-recipient" className="auth-input-label">Nama Penerima</label>
            <input
              id="address-recipient"
              className="auth-input"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="Nama Lengkap"
            />
          </div>
        </div>

        <div className="pv-grid-2">
          <div className="auth-input-wrapper">
            <label htmlFor="address-phone" className="auth-input-label">Nomor Telepon</label>
            <input
              id="address-phone"
              className="auth-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0812xxxx"
            />
          </div>
          <div className="auth-input-wrapper">
            <label htmlFor="address-postal" className="auth-input-label">Kode Pos</label>
            <input
              id="address-postal"
              className="auth-input"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="40132"
            />
          </div>
        </div>

        <div className="pv-grid-2">
          <div className="auth-input-wrapper">
            <label htmlFor="address-province" className="auth-input-label">Provinsi</label>
            <input
              id="address-province"
              className="auth-input"
              value={formData.province}
              onChange={(e) => {
                changeSourceRef.current = "dropdown";
                setFormData({ ...formData, province: e.target.value });
              }}
              placeholder="Provinsi"
            />
          </div>
          <div className="auth-input-wrapper">
            <label htmlFor="address-city" className="auth-input-label">Kota / Kabupaten</label>
            <input
              id="address-city"
              className="auth-input"
              value={formData.city}
              onChange={(e) => {
                changeSourceRef.current = "dropdown";
                setFormData({ ...formData, city: e.target.value });
              }}
              placeholder="Kota / Kabupaten"
            />
          </div>
        </div>

        <div className="auth-input-wrapper pv-mb-16">
          <label htmlFor="address-district" className="auth-input-label">Kecamatan</label>
          <input
            id="address-district"
            className="auth-input"
            value={formData.district}
            onChange={(e) => {
              changeSourceRef.current = "dropdown";
              setFormData({ ...formData, district: e.target.value });
            }}
            placeholder="Kecamatan"
          />
        </div>

        <div className="auth-input-wrapper pv-mb-16">
          <label htmlFor="address-line1" className="auth-input-label">Alamat Lengkap</label>
          <textarea
            id="address-line1"
            className="auth-input"
            rows={2}
            value={formData.line1}
            onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
            placeholder="Nama Jalan, No. Rumah, dll"
          />
        </div>

        {errorMsg && (
          <div className="pv-form-message error mb-4">
            {errorMsg}
          </div>
        )}

        <div className="pv-row-actions gap-3">
          <button
            type="button"
            className="pill-btn pv-btn-outline pv-flex-1"
            onClick={onCancel}
            disabled={isSaving}
          >
            Batal
          </button>
          <button
            type="submit"
            className="pill-btn pv-btn-primary pv-flex-1"
            disabled={isSaving}
          >
            {isSaving ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Tambah Alamat"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { ProfileAddress } from "@/core/providers/ProfileDataContext";

interface AddressCardProps {
  address: ProfileAddress;
  onEdit: (address: ProfileAddress) => void;
  onRemove: (id: string) => Promise<void>;
  onSetPrimary: (id: string) => Promise<void>;
}

export function AddressCard({
  address,
  onEdit,
  onRemove,
  onSetPrimary,
}: AddressCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`pv-item-card ${address.isPrimary ? 'border-primary' : ''}`}>
      <div className="pv-item-meta">
        <div className="pv-item-head">
          <span className="pv-item-name">{address.recipient}</span>
          <span className="pv-item-dot"></span>
          <span>{address.phone}</span>
          {address.isPrimary && (
            <span className="pv-badge-address-primary">UTAMA</span>
          )}
        </div>
        <div className="pv-item-label text-xs font-semibold text-gray-500 mb-1">
          {address.label}
        </div>
        <div className="text-sm text-gray-600">
          <div>{address.line1}</div>
          <div>{address.district}, {address.city}</div>
          <div>{address.province}, {address.postalCode}</div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          className="pill-btn pv-btn-xs"
          onClick={() => onEdit(address)}
          disabled={isLoading}
        >
          Edit
        </button>
        {!address.isPrimary && (
          <button
            type="button"
            className="pill-btn pv-btn-xs"
            onClick={() => handleAction(() => onSetPrimary(address.id))}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Set Utama"}
          </button>
        )}
        <button
          type="button"
          className="pill-btn pv-btn-xs text-red-500 border-red-200 hover:bg-red-50"
          onClick={() => handleAction(() => onRemove(address.id))}
          disabled={isLoading}
        >
          {isLoading ? "..." : "Hapus"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useProfileData, type ProfileAddress } from "@/core/providers/ProfileDataContext";
import { AddressCard } from "./AddressCard";
import { AddressForm } from "./AddressForm";

export function AddressManager() {
  const { addresses, addAddress, updateAddress, removeAddress } = useProfileData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ProfileAddress | null>(null);

  const handleAddAddress = async (data: Omit<ProfileAddress, "id" | "isPrimary">) => {
    const result = await addAddress(data);
    if (result.success) {
      setIsAdding(false);
    }
  };

  const handleUpdateAddress = async (data: Omit<ProfileAddress, "id" | "isPrimary">) => {
    if (!editingAddress) return;
    const result = await updateAddress(editingAddress.id, data);
    if (result.success) {
      setEditingAddress(null);
    }
  };

  const handleRemoveAddress = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      await removeAddress(id);
    }
  };

  const handleSetPrimary = async (id: string) => {
    await updateAddress(id, { isPrimary: true });
  };

  const handleEdit = (address: ProfileAddress) => {
    setEditingAddress(address);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingAddress(null);
  };

  return (
    <section>
      <div className="pv-section-header">
        <p className="profile-section-title pv-title-inline">Alamat Pengiriman</p>
        {!isAdding && !editingAddress && (
          <button
            className="pill-btn pv-btn-primary"
            onClick={() => setIsAdding(true)}
          >
            Tambah Alamat Baru
          </button>
        )}
      </div>

      <div className="pv-content-800">
        {isAdding && (
          <AddressForm
            onSubmit={handleAddAddress}
            onCancel={handleCancel}
          />
        )}

        {editingAddress && (
          <AddressForm
            initialData={editingAddress}
            onSubmit={handleUpdateAddress}
            onCancel={handleCancel}
          />
        )}

        {!isAdding && !editingAddress && (
          <div className="address-list space-y-4">
            {addresses.map((item) => (
              <AddressCard
                key={item.id}
                address={item}
                onEdit={handleEdit}
                onRemove={handleRemoveAddress}
                onSetPrimary={handleSetPrimary}
              />
            ))}
            {addresses.length === 0 && (
              <div className="pv-empty-line">Belum ada alamat pengiriman.</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

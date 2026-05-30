"use client";

import { AddressCard } from "./AddressCard";
import { AddressForm } from "./AddressForm";
import { useAddressManager } from "../hooks/useAddressManager";

export function AddressManager() {
  const { state, actions } = useAddressManager();
  const { addresses, isAdding, editingAddress } = state;
  const { 
    setIsAdding, 
    handleAddAddress, 
    handleUpdateAddress, 
    handleRemoveAddress, 
    handleSetPrimary, 
    handleEdit, 
    handleCancel 
  } = actions;

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

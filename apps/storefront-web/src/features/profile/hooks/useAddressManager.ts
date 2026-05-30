import { useState } from "react";
import { useProfileData, type ProfileAddress } from "@/core/providers/ProfileDataContext";

export function useAddressManager() {
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

  return {
    state: {
      addresses,
      isAdding,
      editingAddress
    },
    actions: {
      setIsAdding,
      handleAddAddress,
      handleUpdateAddress,
      handleRemoveAddress,
      handleSetPrimary,
      handleEdit,
      handleCancel
    }
  };
}

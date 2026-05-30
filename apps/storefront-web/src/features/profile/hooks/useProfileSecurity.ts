import { useState, type FormEvent } from "react";

export function useProfileSecurity(onSavePassword: (payload: { currentPassword: string; newPassword: string }) => boolean) {
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
        ? "Password berhasil diperbarui."
        : "Password saat ini tidak valid."
    );
    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return {
    state: {
      currentPassword,
      newPassword,
      confirmPassword,
      message
    },
    actions: {
      setCurrentPassword,
      setNewPassword,
      setConfirmPassword,
      handleSave
    }
  };
}

"use client";

/**
 * components/auth/profile/ProfileLogoutButton.tsx
 * Logout CTA.
 */

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfileLogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="profile-logout-wrap">
      <button
        onClick={handleLogout}
        className="profile-logout-btn"
        aria-label="Keluar dari akun"
      >
        <span className="profile-logout-icon">
          <LogOut size={16} strokeWidth={2.5} />
        </span>
        <span className="profile-logout-text">Keluar dari Akun</span>
      </button>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import ProfilePage from "@/features/auth/profile/ProfilePage";
import "@/shared/styles/profile.css";
import "@/shared/styles/profile-views.css";

export const metadata: Metadata = {
  title: "Profil Saya | Novarium",
  description: "Kelola akun dan lihat riwayat pesanan Novarium Anda.",
};

export default function ProfileRoute() {
  return (
    <Suspense fallback={<div className="pv-loading-wrap"><div className="animate-spin pv-loading-spinner"></div></div>}>
      <ProfilePage />
    </Suspense>
  );
}

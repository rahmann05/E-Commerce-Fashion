import type { Metadata } from "next";
import RegisterPage from "../../features/auth/register/RegisterPage";
import "@/styles/auth.css";

export const metadata: Metadata = {
  title: "Daftar | Novarium",
  description: "Buat akun Novarium baru untuk mulai berbelanja.",
};

export default function RegisterRoute() {
  return <RegisterPage />;
}

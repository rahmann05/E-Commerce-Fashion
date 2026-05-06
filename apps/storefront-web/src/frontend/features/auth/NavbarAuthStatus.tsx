"use client";

/**
 * components/auth/NavbarAuthStatus.tsx
 * Auth-aware section of the navbar:
 *   - Not logged in → "Login" link
 *   - Logged in     → avatar initials + "Profile" + Logout
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./NavbarAuthStatus.module.css";

function getInitials(name: string = ""): string {
  const safeName = name || "U";
  return safeName
    .split(" ")
    .slice(0, 2)
    .map((w) => w ? w[0] : "")
    .join("")
    .toUpperCase();
}

export default function NavbarAuthStatus() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) return null;

  if (!user) {
    return (
      <Link href="/login?redirect=/profile" className={`navbar-auth-link ${styles.loginLink}`}>
        Login
      </Link>
    );
  }

  return (
    <div className={styles.group}>
      {/* Profile link with avatar */}
      <Link href="/profile" className={`navbar-auth-link ${styles.profileLink}`}>
        <span className="navbar-avatar-sm">{getInitials(user.name)}</span>
        {(user.name || user.email.split("@")[0]).split(" ")[0]}
      </Link>

      {/* Logout */}
      <motion.button
        onClick={() => {
          logout();
          router.push("/");
        }}
        className={styles.logoutButton}
        whileHover={{ color: "#111" } as never}
        whileTap={{ scale: 0.95 } as never}
      >
        Keluar
      </motion.button>
    </div>
  );
}

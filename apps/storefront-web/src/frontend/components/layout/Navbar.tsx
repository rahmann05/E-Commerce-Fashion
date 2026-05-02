"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavbarAuthStatus from "@/components/auth/NavbarAuthStatus";
import { useCart } from "@/context/CartContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  // On non-home pages the navbar is always visible
  const isHome = pathname === "/";
  const isProfile = pathname === "/profile";
  const isDarkPage = isHome || isProfile;

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isHome) {
      setVisible(latest > window.innerHeight * 0.85);
      setScrolled(latest > window.innerHeight);
    } else if (isProfile) {
      // Profile hero is around 400-500px
      setVisible(true); // Always show on profile, just change style
      setScrolled(latest > 350);
    }
  });

  // Always show on sub-pages
  const shouldShow = !isHome || visible;

  const navbarClassName = [
    styles.navbar,
    scrolled ? styles.navbarScrolled : "",
    !scrolled && isDarkPage && !visible ? styles.navbarTransparent : styles.navbarDefault,
  ]
    .filter(Boolean)
    .join(" ");

  const mainNavbarClassName = [
    styles.mainNavbar,
    scrolled || !isDarkPage || visible ? styles.mainNavbarDark : styles.mainNavbarLight,
  ]
    .filter(Boolean)
    .join(" ");


  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: shouldShow ? 0 : -100,
        opacity: shouldShow ? 1 : 0,
      }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={navbarClassName}
    >
      <div className={mainNavbarClassName}>
        <div className={styles.navLinksGroup}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/catalogue" className={styles.navLink}>Catalogue</Link>
          <Link href="/about" className={styles.navLink}>About Us</Link>
        </div>
        <Link href="/" className={styles.brand}>
          Novure
        </Link>
        <div className={styles.actionsGroup}>
          <CartLink />
          <NavbarAuthStatus />
        </div>
      </div>
    </motion.nav>
  );
}

function CartLink() {
  const { totalItems } = useCart();

  return (
    <Link href="/catalogue/cart" className={styles.cartLink}>
      Cart
      {totalItems > 0 && (
        <span className={styles.cartBadge}>
          {totalItems}
        </span>
      )}
    </Link>
  );
}

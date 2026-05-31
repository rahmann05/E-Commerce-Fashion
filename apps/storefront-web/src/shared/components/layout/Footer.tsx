"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FooterProps {
  noAnimation?: boolean;
}

export default function Footer({ noAnimation = false }: FooterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Do not render footer on profile or cart/checkout pages
  if (pathname && (pathname.startsWith("/profile") || pathname.startsWith("/catalogue/cart"))) {
    return null;
  }

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const rawScale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const scale = useSpring(rawScale, { stiffness: 60, damping: 20 });

  const links = [
    {
      title: "Shop",
      items: [
        { label: "Katalog", href: "/catalogue" },
        { label: "My Cart", href: "/catalogue/cart" },
        { label: "Profil", href: "/profile" },
        { label: "Login", href: "/login" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About Us", href: "/about" },
        { label: "Home", href: "/" },
      ],
    },
  ];

  return (
    <motion.footer
      ref={ref}
      style={{ scale: noAnimation ? 1 : scale }}
      className="site-footer"
    >
      {/* Main grid: brand + link columns */}
      <div className="footer-grid">
        {/* Brand col */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: "1rem" }}>
            Novarium
          </div>
          <p style={{ lineHeight: 1.7, maxWidth: 240, fontSize: "0.82rem" }}>
            Essentialized daily wear buat cowok modern. Dibuat dengan purpose yang jelas.
          </p>
        </motion.div>

        {/* Link cols */}
        {links.map((col, ci) => (
          <motion.div
            key={col.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 + ci * 0.1 }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", marginBottom: "1.2rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {col.title}
            </div>
            {col.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: "block",
                  marginBottom: "0.7rem",
                  color: "rgba(255,255,255,0.38)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                  fontSize: "0.82rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <motion.div
        className="footer-divider"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "left" }}
      />

      {/* Bottom row */}
      <div className="footer-bottom">
        © 2026 Novarium. All rights reserved.
      </div>
    </motion.footer>
  );
}

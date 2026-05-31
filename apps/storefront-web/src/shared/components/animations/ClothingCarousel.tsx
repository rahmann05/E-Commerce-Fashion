"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/shared/utils/image-utils";
import type { CatalogueProduct } from "@/features/catalogue/types";

interface ClothingCarouselProps {
  currentTee: CatalogueProduct;
  currentJeans: CatalogueProduct;
  comboKey: number;
  onNext: () => void;
  onPrev: () => void;
  yCards: MotionValue<number>;
}

export default function ClothingCarousel({
  currentTee,
  currentJeans,
  comboKey,
  onNext,
  onPrev,
  yCards,
}: ClothingCarouselProps) {
  const router = useRouter();

  return (
    <motion.div
      style={{
        y: yCards,
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "10%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.2rem",
        zIndex: 30,
        width: "100%",
      }}
    >
      {/* Controls + Cards */}
      <div className="carousel-controls-wrapper" style={{ display: "flex", alignItems: "center", gap: "2rem", width: "100%", maxWidth: "800px", justifyContent: "center", padding: "0 1rem" }}>
        <button
          className="carousel-arrow-btn"
          aria-label="Previous combination"
          onClick={onPrev}
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            flexShrink: 0,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          <ChevronLeft size={28} color="#111" />
        </button>
 
        <div className="carousel-cards-wrapper" style={{ width: "100%", maxWidth: "640px", position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={comboKey}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.4 }}
              style={{ display: "flex", gap: "2rem", width: "100%", margin: 0 }}
              className="essentialized-mobile-grid"
            >
              <div
                className="floating-product-card"
                style={{ flex: 1, padding: "2rem", width: "auto", height: "300px" }}
              >
                <span className="card-label" style={{ fontSize: "1.1rem" }}>
                   {currentTee.name}
                </span>
                <div className="card-image" style={{ height: "220px", position: "relative" }}>
                  <Image
                    src={getImageUrl(currentTee.image || "/images/about/model1.png")}
                    alt={currentTee.name || "Clothing Item"}
                    fill
                    className="object-contain"
                    style={{ mixBlendMode: "darken", transition: "all 0.6s ease" }}
                  />
                </div>
              </div>
              <div
                className="floating-product-card"
                style={{ flex: 1, padding: "2rem", width: "auto", height: "300px" }}
              >
                <span className="card-label" style={{ fontSize: "1.1rem" }}>
                  {currentJeans.name}
                </span>
                <div className="card-image" style={{ height: "220px", position: "relative" }}>
                  <Image
                    src={getImageUrl(currentJeans.image || "/images/about/model1.png")}
                    alt={currentJeans.name || "Clothing Item"}
                    fill
                    className="object-contain"
                    style={{ mixBlendMode: "darken", transition: "all 0.6s ease" }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          className="carousel-arrow-btn"
          aria-label="Next combination"
          onClick={onNext}
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            flexShrink: 0,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          <ChevronRight size={28} color="#111" />
        </button>
      </div>

      {/* Centered Buy Now Button */}
      <motion.button
        className="buy-now-btn"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => router.push("/catalogue")}
        style={{ position: "relative" }}
      >
        Buy Now
        <span className="arrow-circle">
          <ArrowUpRight size={14} />
        </span>
      </motion.button>
    </motion.div>
  );
}


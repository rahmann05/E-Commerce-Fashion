"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { CategoryFilter } from "@/shared/api/catalogue";

import AnimatedText from "@/shared/components/ui/AnimatedText";

interface Props {
  activeCategory: CategoryFilter;
  counts: Record<string, number>;
  onCategoryChange: (cat: CategoryFilter) => void;
  sortOrder: "asc" | "desc" | "default";
  onSortChange: (sort: "asc" | "desc" | "default") => void;
}

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: "all",        label: "All Items"    },
  { key: "tees",       label: "Tees"         },
  { key: "jeans",      label: "Denim"        },
  { key: "outerwear",  label: "Outerwear"    },
  { key: "accessories",label: "Accessories"  },
  { key: "editorial",  label: "Editorial"    },
];

const SORT_OPTIONS: { key: "default" | "asc" | "desc"; label: string }[] = [
  { key: "default", label: "Featured"     },
  { key: "asc",     label: "Price ↑ Low" },
  { key: "desc",    label: "Price ↓ High"},
];

export default function CatalogueFilterSidebar({
  activeCategory,
  counts,
  onCategoryChange,
  sortOrder,
  onSortChange,
}: Props) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setCategoryOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCatLabel = CATEGORIES.find(c => c.key === activeCategory)?.label || "All Items";
  const activeSortLabel = SORT_OPTIONS.find(s => s.key === sortOrder)?.label || "Featured";

  return (
    <motion.aside
      className="catalogue-sidebar"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ overflow: "visible" }} // Ensure dropdowns are not clipped
    >
      <AnimatedText text="Filter & Sort" as="p" style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", marginBottom: "1.5rem" }} />

      {/* Category section with Dropdown */}
      <div className="sidebar-section" ref={catRef} style={{ position: "relative", zIndex: 30 }}>
        <div className="sidebar-section-label">Category</div>
        
        <button
          className="sidebar-dropdown-trigger"
          onClick={() => {
            setCategoryOpen(!categoryOpen);
            setSortOpen(false);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "0.8rem 1.5rem",
            borderRadius: "9999px",
            background: "#111",
            color: "#fff",
            fontSize: "0.88rem",
            fontWeight: 500,
            border: "1px solid #111",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease"
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {activeCatLabel}
            <span style={{ fontSize: "0.75rem", opacity: 0.6, fontWeight: 400 }}>
              ({counts[activeCategory] ?? 0})
            </span>
          </span>
          <ChevronDown 
            size={16} 
            style={{ 
              transform: categoryOpen ? "rotate(180deg)" : "rotate(0deg)", 
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)" 
            }} 
          />
        </button>

        <AnimatePresence>
          {categoryOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                top: "calc(100% + 0.5rem)",
                left: 0,
                width: "100%",
                background: "rgba(255, 255, 255, 0.98)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                borderRadius: "1rem",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                padding: "0.5rem",
                backdropFilter: "blur(10px)",
                zIndex: 50,
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    onCategoryChange(cat.key);
                    setCategoryOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "0.7rem 1.25rem",
                    borderRadius: "0.6rem",
                    fontSize: "0.85rem",
                    fontWeight: activeCategory === cat.key ? 600 : 400,
                    color: activeCategory === cat.key ? "#fff" : "#444",
                    backgroundColor: activeCategory === cat.key ? "#111" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease"
                  }}
                  className="sidebar-dropdown-option"
                >
                  <span>{cat.label}</span>
                  <span style={{ fontSize: "0.75rem", opacity: activeCategory === cat.key ? 0.8 : 0.5 }}>
                    {counts[cat.key] ?? 0}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div
        style={{
          width: "100%",
          height: "1px",
          background: "rgba(0,0,0,0.07)",
          margin: "1.5rem 0",
        }}
      />

      {/* Sort section with Dropdown */}
      <div className="sidebar-section" ref={sortRef} style={{ position: "relative", zIndex: 20 }}>
        <div className="sidebar-section-label">Sort by</div>

        <button
          className="sidebar-dropdown-trigger"
          onClick={() => {
            setSortOpen(!sortOpen);
            setCategoryOpen(false);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "0.8rem 1.5rem",
            borderRadius: "9999px",
            background: "#111",
            color: "#fff",
            fontSize: "0.88rem",
            fontWeight: 500,
            border: "1px solid #111",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease"
          }}
        >
          <span>{activeSortLabel}</span>
          <ChevronDown 
            size={16} 
            style={{ 
              transform: sortOpen ? "rotate(180deg)" : "rotate(0deg)", 
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)" 
            }} 
          />
        </button>

        <AnimatePresence>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                top: "calc(100% + 0.5rem)",
                left: 0,
                width: "100%",
                background: "rgba(255, 255, 255, 0.98)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                borderRadius: "1rem",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                padding: "0.5rem",
                backdropFilter: "blur(10px)",
                zIndex: 50,
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    onSortChange(opt.key);
                    setSortOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.7rem 1.25rem",
                    borderRadius: "0.6rem",
                    fontSize: "0.85rem",
                    fontWeight: sortOrder === opt.key ? 600 : 400,
                    color: sortOrder === opt.key ? "#fff" : "#444",
                    backgroundColor: sortOrder === opt.key ? "#111" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease"
                  }}
                  className="sidebar-dropdown-option"
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative info card — hidden on mobile via CSS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="neo-card sidebar-info-card"
        style={{ marginTop: "2rem", padding: "1.4rem 1.5rem" }}
      >
        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#111", marginBottom: "0.6rem" }}>
          Free Shipping
        </div>
        <div style={{ fontSize: "0.82rem", color: "#777", lineHeight: 1.65 }}>
          On orders above Rp500k. Delivered in 2–4 business days.
        </div>
      </motion.div>
    </motion.aside>
  );
}

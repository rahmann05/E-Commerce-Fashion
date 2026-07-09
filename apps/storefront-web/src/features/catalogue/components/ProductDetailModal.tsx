"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ArrowUpRight, Star, Heart } from "lucide-react";
import type { CatalogueProduct } from "../types";
import { useAuth } from "@/core/providers/AuthContext";
import { useCart } from "@/core/providers/CartContext";
import { useProfileData } from "@/core/providers/ProfileDataContext";
import ProductReviews from "@/features/catalogue/components/ProductReviews";

interface Props {
  product: CatalogueProduct | null;
  onClose: () => void;
}

/** Format price without toLocaleString (avoids SSR/client locale mismatch) */
function formatPrice(price: number): string {
  // If price is low (e.g. 250), assume it's in thousands
  const finalPrice = price < 10000 ? price * 1000 : price;
  return finalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function ProductDetailModal({ product, onClose }: Props) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlistItem, isWishlisted } = useProfileData();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);

  const variants = useMemo(() => product?.variants ?? [], [product]);
  const hasVariantColors = useMemo(() => variants.some((v: any) => !!v.color), [variants]);

  const sizeOptions: string[] = useMemo(() => variants.length > 0 ? Array.from(new Set(variants.map((v: any) => v.size).filter((s: any) => !!s))) : [], [variants]);

  const colorOptions: string[] = useMemo(() => hasVariantColors ? Array.from(new Set(variants.map((v: any) => v.color).filter((c: any) => !!c))) : (product?.colors || []), [hasVariantColors, variants, product]);

  const stockBySize: Record<string, number> = useMemo(() => sizeOptions.reduce((acc: Record<string, number>, size: string) => {
    acc[size] = variants.filter((v: any) => v.size === size).reduce((sum: number, v: any) => sum + v.stock, 0);
    return acc;
  }, {} as Record<string, number>), [sizeOptions, variants]);

  const selectedVariant = useMemo(() => {
    if (!selectedSize) return null;
    return variants.find((v: any) => v.size === selectedSize) || null;
  }, [variants, selectedSize]);

  const selectedVariantStock = selectedVariant?.stock ?? 0;

  async function handleAdd() {
    if (!user) {
      onClose();
      router.push("/login?redirect=/catalogue");
      return;
    }

    if (!product) return;

    if (!selectedSize) {
      setAddError("Silakan pilih ukuran terlebih dahulu.");
      return;
    }

    if (!selectedVariant || selectedVariantStock <= 0) {
      setAddError("Maaf, stok untuk ukuran ini sedang habis.");
      return;
    }

    try {
      setAddError(null);
      await addToCart(product, selectedVariant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menambahkan produk ke cart.";
      setAddError(msg);
    }
  }

  const wished = product ? isWishlisted(product.id) : false;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="modal-backdrop"
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="modal-sheet"
            initial={{ opacity: 0, y: 80, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {/* ── Left: product image ── */}
            <div className="modal-image-col">
              <Image
                src={product.images?.[0] || product.image || "/images/about/model1.png"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 42vw"
                priority
              />

              {/* Bottom gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "40%",
                  background: "linear-gradient(180deg, transparent, rgba(10,10,10,0.5))",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />

              {/* Price badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  left: "1.5rem",
                  zIndex: 5,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "3rem",
                  padding: "0.6rem 1.4rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "#111",
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                }}
              >
                Rp {formatPrice(product.price)}
              </motion.div>

              {/* Close button */}
              <motion.button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Close"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* ── Right: product details ── */}
            <div className="modal-detail-col">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
                <div className="modal-product-category">{product.category}</div>
                <h2 className="modal-product-name">{product.name}</h2>

                {/* Star rating */}
                <div style={{ display: "flex", gap: "3px", marginBottom: "1.2rem" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < (((product.rating || 5) || 5) || 5) ? "#111" : "#ddd"}
                      color={i < (((product.rating || 5) || 5) || 5) ? "#111" : "#ddd"}
                    />
                  ))}
                  <span
                    style={{ fontSize: "0.75rem", color: "#aaa", marginLeft: "0.5rem", alignSelf: "center" }}
                  >
                    {(((product.rating || 5) || 5) || 5)}/5
                  </span>
                </div>

                <div className="modal-product-desc" dangerouslySetInnerHTML={{ __html: product.description || '' }}></div>

                {/* Size selector */}
                {sizeOptions.length > 0 && (
                  <>
                    <div className="modal-size-label">Pilih Ukuran</div>
                    <div className="modal-sizes-row">
                      {sizeOptions.map((size) => {
                        const isOutOfStock = (stockBySize[size as string] ?? 0) <= 0;
                        return (
                        <motion.button
                          type="button"
                          key={size}
                          className={`modal-size-btn${selectedSize === size ? " selected" : ""}`}
                          onClick={() => setSelectedSize(size)}
                          disabled={isOutOfStock}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={isOutOfStock ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                        >
                          {size} ({stockBySize[size as string] ?? 0})
                        </motion.button>
                      );
                      })}
                    </div>
                  </>
                )}

                {/* Color selector */}
                {colorOptions.length > 0 && (
                  <>
                    <div className="modal-colors-label">Warna</div>
                    <div className="modal-colors-row">
                      {colorOptions.map((color: any) => (
                        <button
                          type="button"
                          key={color}
                          className={`modal-color-btn${selectedColor === color ? " selected" : ""}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {variants.length > 0 && (
                  <div style={{ marginBottom: "1rem", fontSize: "0.82rem", color: "#666" }}>
                    Stock tersedia: <strong style={{ color: "#111" }}>{selectedVariantStock}</strong>
                  </div>
                )}

                {/* Add to Cart */}
                <motion.button
                  type="button"
                  className="modal-add-btn"
                  onClick={handleAdd}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: "#111",
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={added ? "added" : "add"}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {added
                        ? "Masuk ke Cart ✓"
                        : user
                          ? "Masuk ke Cart"
                          : "Login untuk Membeli"}
                    </motion.span>
                  </AnimatePresence>
                  {!added && (
                    <span className="btn-arrow">
                      <ArrowUpRight size={14} />
                    </span>
                  )}
                </motion.button>
                <button
                  type="button"
                  className="pill-btn"
                  style={{
                    width: "100%",
                    marginTop: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    background: "transparent",
                    border: "1px solid #111",
                    color: "#111",
                    height: "3.2rem",
                    borderRadius: "2rem",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onClick={() => {
                    if (!product) return;
                    if (!user) {
                      onClose();
                      router.push("/login?redirect=/catalogue");
                      return;
                    }
                    toggleWishlistItem({
                      productId: product.id.toString(),
                      name: product.name,
                      image: product.image || product.imageUrl || "",
                      price: product.price,
                      category: product.category || "Uncategorized"
                    });
                    setWishlistMessage(
                      wished ? "Dihapus dari wishlist." : "Ditambahkan ke wishlist."
                    );
                    setTimeout(() => setWishlistMessage(null), 3000);
                  }}
                >
                  <Heart 
                    size={16} 
                    fill={wished ? "#ff3b30" : "transparent"} 
                    color={wished ? "#ff3b30" : "#111"} 
                    style={{ transition: "all 0.3s ease" }}
                  />
                  {wished ? "Terdaftar di Wishlist" : "Tambah ke Wishlist"}
                </button>
                {wishlistMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#111", textAlign: "center", fontWeight: 500 }}
                  >
                    {wishlistMessage}
                  </motion.div>
                )}

                {addError && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#b91c1c" }}>
                    {addError}
                  </div>
                )}

                <div
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.75rem",
                    color: "#bbb",
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  Gratis ongkir belanja di atas Rp500k · Gampang balikin dalam 30 hari
                </div>

                <ProductReviews productId={product.id.toString()} />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

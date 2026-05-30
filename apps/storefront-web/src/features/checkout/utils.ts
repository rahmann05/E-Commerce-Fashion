export const STANDARD_PAYMENTS = [
  { id: "std_qris", label: "QRIS", details: "Dana, OVO, LinkAja, dsb." },
  { id: "std_gopay", label: "GoPay", details: "Bayar via Gojek" },
  { id: "std_bca", label: "BCA Virtual Account", details: "Transfer Bank BCA" },
  { id: "std_bni", label: "BNI Virtual Account", details: "Transfer Bank BNI" },
  { id: "std_bri", label: "BRI Virtual Account", details: "Transfer Bank BRI" },
  { id: "std_mandiri", label: "Mandiri Bill", details: "Transfer Bank Mandiri" },
  { id: "std_alfamart", label: "Alfamart", details: "Gerai Alfamart" },
];

export function normalizePrice(price: unknown): number {
  const p = Number(price ?? 0);
  if (!Number.isFinite(p)) return 0;
  return p < 10000 ? p * 1000 : p;
}

export function formatPrice(price: number): string {
  return `Rp ${Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function mapPaymentMethodToMidtransKey(label: string): string {
  const text = label.toLowerCase();
  if (text.includes("bni")) return "bni_va";
  if (text.includes("bri")) return "bri_va";
  if (text.includes("mandiri")) return "echannel";
  if (text.includes("qris")) return "qris";
  if (text.includes("gopay")) return "gopay";
  if (text.includes("alfamart")) return "alfamart";
  return "bca_va";
}

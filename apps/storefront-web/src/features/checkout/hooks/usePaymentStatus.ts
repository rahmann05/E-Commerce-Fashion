import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/core/providers/AuthContext";
import { useProfileData } from "@/core/providers/ProfileDataContext";
import { ordersApi } from "@/shared/api/orders";

export interface MidtransStatus {
  transaction_status: string;
  payment_type: string;
  gross_amount?: string | number;
  order_id: string;
  transaction_time?: string;
  expiry_time?: string;
  va_numbers?: Array<{ bank: string; va_number: string }>;
  permata_va_number?: string;
  bill_key?: string;
  biller_code?: string;
  actions?: Array<{ name: string; url: string; method: string }>;
  qr_code_url?: string;
  token?: string;
  redirect_url?: string;
  method?: string;
}

export const PAYMENT_METHODS: Record<string, { midtransId: string; bank?: string; label: string }> = {
  bca_va: { midtransId: "bank_transfer", bank: "bca", label: "BCA Virtual Account" },
  bni_va: { midtransId: "bank_transfer", bank: "bni", label: "BNI Virtual Account" },
  bri_va: { midtransId: "bank_transfer", bank: "bri", label: "BRI Virtual Account" },
  mandiri_va: { midtransId: "echannel", label: "Mandiri Bill Payment" },
  permata_va: { midtransId: "bank_transfer", bank: "permata", label: "Permata Virtual Account" },
  gopay: { midtransId: "gopay", label: "GoPay" },
  qris: { midtransId: "qris", label: "QRIS" },
  indomaret: { midtransId: "cstore", label: "Indomaret" },
  alfamart: { midtransId: "cstore", label: "Alfamart" }
};

export function usePaymentStatus() {
  const params = useParams();
  const { user } = useAuth();
  const { orders } = useProfileData();
  const orderId = params.orderId as string;

  const [status, setStatus] = useState<MidtransStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const localOrder = useMemo(() => {
    return orders.find((o) => String(o.id) === String(orderId));
  }, [orders, orderId]);

  const initiateCharge = useCallback(async (forcedMethod?: string) => {
    setLoading(true);
    try {
      const methodKey = forcedMethod || new URLSearchParams(window.location.search).get("method") || "bca_va";
      const methodObj = PAYMENT_METHODS[methodKey];

      const result = await ordersApi.initiateMidtransCharge({
        order_id: orderId,
        payment_type: methodObj?.midtransId || "bank_transfer",
        bank: methodObj?.bank,
        customer_details: {
          first_name: user?.name,
          email: user?.email,
        },
      });

      if (result.success) {
        setStatus(result.data as unknown as MidtransStatus);
        setError(null);
      } else {
        setError(result.error || "Gagal memulai pembayaran.");
      }
    } catch (err: unknown) {
      console.error("Charge initiation error:", err);
      setError("Gagal menghubungi server pembayaran.");
    } finally {
      setLoading(false);
    }
  }, [orderId, user]);

  const fetchStatus = useCallback(async (isRetry = false) => {
    if (!isRetry) setLoading(true);

    try {
      const result = await ordersApi.getMidtransStatus(orderId);

      if (result.success && result.data && (result.data as any).transaction_status) {
        setStatus(result.data as unknown as MidtransStatus);
        setLoading(false);
      } else {
        const methodKey = new URLSearchParams(window.location.search).get("method");
        await initiateCharge(methodKey || "bca_va");
      }
    } catch (err: unknown) {
      console.error("Status fetch error:", err);
      const methodKey = new URLSearchParams(window.location.search).get("method");
      if (!isRetry) {
        await initiateCharge(methodKey || "bca_va");
      } else {
        setError("Terjadi kesalahan koneksi.");
        setLoading(false);
      }
    }
  }, [orderId, initiateCharge]);

  useEffect(() => {
    if (orderId) {
      const timer = setTimeout(() => {
        const methodKey = new URLSearchParams(window.location.search).get("method");
        if (methodKey) {
          void initiateCharge(methodKey);
        } else {
          void fetchStatus();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [orderId, initiateCharge, fetchStatus]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentDetails = useMemo(() => {
    if (!status) return null;

    let methodLabel = (status.payment_type || status.method || "Pembayaran").replace(/_/g, " ").toUpperCase();
    let vaNumber = "";

    if (status.va_numbers && status.va_numbers.length > 0) {
      methodLabel = `${status.va_numbers[0].bank.toUpperCase()} VIRTUAL ACCOUNT`;
      vaNumber = status.va_numbers[0].va_number;
    } else if (status.permata_va_number) {
      methodLabel = "PERMATA VIRTUAL ACCOUNT";
      vaNumber = status.permata_va_number;
    } else if (status.payment_type === "qris") {
      methodLabel = "QRIS / E-WALLET";
    } else if (status.payment_type === "gopay") {
      methodLabel = "GOPAY";
    } else if (status.payment_type === "cstore") {
      methodLabel = "ALFAMART / INDOMARET";
    } else if (status.payment_type === "echannel") {
      methodLabel = "MANDIRI BILL PAYMENT";
      vaNumber = `${status.biller_code} / ${status.bill_key}`;
    } else if (status.method === "snap") {
      methodLabel = "SNAP GATEWAY";
    }

    return { methodLabel, vaNumber };
  }, [status]);

  const qrAction = useMemo(() => {
    if (!status || !status.actions) return null;
    return status.actions.find((a) => a.name === "generate-qr-code");
  }, [status]);

  return {
    state: {
      status,
      loading,
      error,
      copied,
      localOrder,
      paymentDetails,
      qrAction,
      orderId,
      user
    },
    actions: {
      handleCopy,
      fetchStatus,
      initiateCharge
    }
  };
}

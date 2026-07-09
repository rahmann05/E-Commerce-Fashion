"use client";

/**
 * components/auth/profile/ProfileOrderHistory.tsx
 * Order history section.
 */

import ProfileOrderCard, { type MockOrder } from "./ProfileOrderCard";
import type { ProfileOrder } from "@/core/providers/ProfileDataContext";
import { getImageUrl } from "@/shared/utils/image-utils";

interface ProfileOrderHistoryProps {
  orders: ProfileOrder[];
}

function formatPrice(price: number): string {
  return `Rp ${Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export default function ProfileOrderHistory({ orders }: ProfileOrderHistoryProps) {
  return (
    <section>
      <p className="profile-section-title">
        Riwayat Pesanan
      </p>
      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map((order) => {
            const primaryItem = order.items[0];
            
            // Helper to map hex codes to readable color names
            const formatColor = (color: string) => {
              if (!color) return color;
              if (!color.startsWith('#')) return color;
              const c = color.toLowerCase();
              if (c === '#fafafa' || c === '#ffffff' || c === '#fff') return 'White';
              if (c === '#111111' || c === '#000000' || c === '#000' || c === '#111') return 'Black';
              if (c === '#4b5563') return 'Gray';
              if (c === '#3b82f6') return 'Blue';
              return color;
            };

            const displayOrder = {
              id: order.id,
              date: new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              productName: primaryItem?.name ?? "Pesanan",
              details: primaryItem
                ? `Size: ${primaryItem.size || "All Size"} · Color: ${formatColor(primaryItem.color) || "Default"} · Qty: ${primaryItem.quantity}`
                : "Rincian produk tidak tersedia",
              imageUrl: getImageUrl(primaryItem?.imageUrl) || "/images/about/model1.png",
              total: formatPrice(order.total),
              status: order.status as MockOrder["status"],
              productId: primaryItem?.productId
            };
            return <ProfileOrderCard key={order.id} order={displayOrder} />;
          })
        ) : (
          <div className="pv-empty-block">
            <p className="pv-empty-message">Anda belum memiliki riwayat pesanan.</p>
          </div>
        )}
      </div>
    </section>
  );
}

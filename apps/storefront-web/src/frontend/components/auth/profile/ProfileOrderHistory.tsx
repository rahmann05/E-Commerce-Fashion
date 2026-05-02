"use client";

/**
 * components/auth/profile/ProfileOrderHistory.tsx
 * Order history section.
 */

import ProfileOrderCard from "./ProfileOrderCard";
import type { ProfileOrder } from "@/context/ProfileDataContext";
import { getImageUrl } from "@/lib/image-utils";

interface ProfileOrderHistoryProps {
  orders: ProfileOrder[];
}

function formatPrice(price: number): string {
  const finalPrice = price < 10000 ? price * 1000 : price;
  return `Rp ${finalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
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
            const displayOrder = {
              id: order.id,
              date: new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              productName: primaryItem?.name ?? "Pesanan",
              details: primaryItem
                ? `Size: ${primaryItem.size || "All Size"} · Color: ${primaryItem.color || "Default"} · Qty: ${primaryItem.quantity}`
                : "Rincian produk tidak tersedia",
              imageUrl: getImageUrl(primaryItem?.imageUrl) || "/images/about/model1.png",
              total: formatPrice(order.total),
              status: order.status as any,
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

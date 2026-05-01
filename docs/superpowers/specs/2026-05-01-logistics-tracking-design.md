# Logistics & Tracking System Design

**Date:** 2026-05-01
**Topic:** Implementation of granular shipping tracking and carrier management to achieve Shopee/Lazada scale.

## 1. Problem Statement
The current system only has a basic `OrderStatus` (SHIPPED, DELIVERED). Large-scale e-commerce platforms require detailed tracking logs and carrier information to provide transparency to customers and efficiency for admins.

## 2. Proposed Design

### 2.1 Database Schema (Neon / admin-service)
We will add three new models to the Neon database to handle logistics:

#### ShippingCarrier
- `id`: String (CUID)
- `name`: String (e.g., "JNE", "J&T", "Shopee Express")
- `code`: String (Unique identifier for API integrations)
- `isActive`: Boolean

#### ShippingTracking
- `id`: String (CUID)
- `orderId`: String (Unique, Foreign Key to Order)
- `carrierId`: String (Foreign Key to ShippingCarrier)
- `trackingNumber`: String
- `estimatedArrival`: DateTime
- `currentStatus`: String (e.g., "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY")
- `lastLocation`: String

#### ShippingLog
- `id`: String (CUID)
- `trackingId`: String (Foreign Key to ShippingTracking)
- `status`: String
- `location`: String
- `description`: String
- `timestamp`: DateTime

### 2.2 API Architecture

#### API Gateway
New route group for shipping:
- `GET /api/storefront/shipping/track/:orderId` -> Proxy to `admin-service`
- `GET /api/admin/management/shipping/carriers` -> Proxy to `admin-service`
- `POST /api/admin/management/shipping/track` -> Proxy to `admin-service`

Explicit Gateway Logic in `services/api-gateway/index.ts`:
```typescript
app.use(['/api/storefront/shipping'], createProxyMiddleware({
  ...proxyOptions(`${ADMIN_BACKEND_URL}/api/storefront/shipping`),
}));
app.use(['/api/admin/management/shipping'], createProxyMiddleware({
  ...proxyOptions(`${ADMIN_BACKEND_URL}/api/admin/management/shipping`),
}));
```

#### Admin Service (Backend)
- `GET /api/storefront/shipping/track/[orderId]`: Public endpoint for customers to see their tracking info.
- `GET /api/admin/management/shipping/carriers`: List all available carriers.
- `POST /api/admin/management/shipping/track`: Admin endpoint to initialize tracking for an order.
- `POST /api/admin/management/shipping/log`: Admin endpoint to add a new tracking update.

### 2.3 Seeding Strategy
We will update `services/admin-service/prisma/seed.ts` to include standard Indonesian carriers:
- JNE (Jalur Nugraha Ekakurir)
- J&T Express
- SiCepat Ekspres
- Shopee Express
- GoSend / GrabExpress

## 4. Verification Plan
- **Seeding:** Run `npx prisma db seed` and verify `ShippingCarrier` table is populated.
- **Gateway:** Use `curl` or Postman to hit Gateway shipping endpoints and verify they proxy to `admin-service`.
- **Logic:** Verify that adding a `ShippingLog` correctly updates the `currentStatus` in `ShippingTracking`.

# Enterprise Automation: Midtrans Webhook & Supabase Storage Design

**Date:** 2026-05-01
**Topic:** Automating payment status updates via Midtrans Webhooks and standardizing image storage using Supabase.

## 1. Goal
1.  Implement a secure webhook handler to automatically update order status from `AWAITING_PAYMENT` to `PROCESSING` (or `CANCELLED`) based on Midtrans notifications.
2.  Eliminate third-party dependencies (Uploadcare) by standardizing all image uploads to direct Supabase Storage.

## 2. Proposed Design

### 2.1 Midtrans Webhook (Neon / admin-service)
**Endpoint:** `POST /api/storefront/checkout/midtrans/notification`

**Logic:**
1.  **Verification:** Verify the notification's authenticity using the Midtrans Server Key and SHA512 signature hashing.
2.  **Order Mapping:** Find the `Order` in Neon using `order_id` from the payload.
3.  **Status Transition:**
    - `settlement` / `capture`: Update Order status to `PROCESSING`.
    - `expire` / `cancel` / `deny`: Update Order status to `CANCELLED`.
4.  **Audit Log:** Record the payment notification in the `AuditLog` table for admin transparency.

### 2.2 Supabase Storage (admin-web)
**Component:** `UploadImage.svelte`

**Improvements:**
1.  **Bucket Structure:** Standardize on a `products` bucket with folders for `items` and `categories`.
2.  **Public Access:** Ensure the component generates public URLs using `supabase.storage.from(bucket).getPublicUrl(path)`.
3.  **Integration:** Update the Product and Category creation forms in `admin-web` to use this component instead of any old placeholders.

### 2.3 API Gateway Updates
**Route:** Add the notification route to the proxy filter.
```typescript
app.use(createProxyMiddleware({
  pathFilter: ['/api/storefront/checkout/midtrans/notification'],
  ...proxyOptions(ADMIN_BACKEND_URL)
}));
```

## 3. Data Flow (Webhook)
1.  Customer pays via Midtrans (GoPay/VA/CC).
2.  Midtrans sends a `POST` request to our Gateway.
3.  Gateway proxies to `admin-service`.
4.  `admin-service` verifies signature.
5.  `admin-service` updates `Order` status in Neon.
6.  Admin sees the order as "PROCESSING" in the dashboard instantly.

## 4. Verification Plan
- **Webhook Test:** Use the Midtrans Simulator to send dummy notifications to a local tunnel (e.g., Ngrok) pointing to the Gateway.
- **Storage Test:** Manually upload an image via the Admin Dashboard and verify it appears in the Supabase Storage bucket and the UI preview.
- **Data Integrity:** Verify that a `settlement` status correctly moves an order out of the "Pending" state in the Analytics dashboard.

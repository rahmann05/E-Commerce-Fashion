# Midtrans-Mirror Admin UI Redesign Specification

**Date:** 2026-05-01
**Topic:** Comprehensive redesign of the `admin-web` dashboard to mirror Midtrans functionality using Storefront styling conventions.

## 1. Goal
Replace the generic, non-functional AI-generated admin dashboard with a high-fidelity, highly functional interface focused on financial metrics, transaction logs, and logistics tracking. The UI must strictly adhere to the `STYLING_GUIDE.md` of the storefront (Inter font, high border radius, high contrast black/white, minimal borders, pill buttons).

## 2. Design Architecture

### 2.1 Global Styling (`app.css` / `admin.css`)
- **Font:** Inter (replace Outfit).
- **Backgrounds:** `--bg-studio: #f9f9f9`, Card Background: `#ffffff`.
- **Borders & Radii:** Subtle borders (`1px solid #f0f0f0`), high border radii (`1.2rem` for cards, `999px` for buttons).
- **Typography:** Deep contrast (Heading `#000` weight 800/900, Subtitles `#888` weight 500).
- **Navigation:** Top-sticky navbar (Storefront style) replacing sidebars if present.

### 2.2 Page 1: Overview (`/analytics` -> `/`)
**Functionality (Mirroring Midtrans Dashboard):**
- **Top Metrics Cards:**
  1.  **Gross Transaction Value (30D):** Total revenue from `API_BASE_URL/analytics`.
  2.  **Net Settlement (Est):** Gross Profit from `API_BASE_URL/analytics` (calculated based on COGS/Fee logic).
  3.  **Payment Success Rate:** Calculated as `(Completed Orders / Total Orders) * 100`.
- **Recent Transactions Table:** A clean, Midtrans-style table showing Order ID, Customer Name, Payment Type, Gross Amount, and Status Pill.
  - Fetches latest 5 orders from `/orders` API.

### 2.3 Page 2: Transactions (`/orders`)
**Functionality (Mirroring Midtrans Transactions):**
- Full-page data table.
- **Search & Filter:** Input for Order ID / Customer Name, and dropdown for Status filtering.
- **Columns:** Order ID, Date/Time, Customer, Payment Method (e.g., GoPay, CC), Amount, Status.
- **Row Click:** Navigates to `/orders/[id]`.

### 2.4 Page 3: Transaction Detail & Logistics (`/orders/[id]`)
**Functionality:**
- **Header:** Order ID, Status, Total Amount, Date.
- **Two-Column Layout:**
  - **Left Column (Payment Details):** Customer Info, Payment Method details, Itemized breakdown (like a receipt).
  - **Right Column (Logistics & Tracking):**
    - If status is `PROCESSING`: Show a form to "Input Tracking" (Select Carrier, Input Resi) calling `POST /shipping/track`.
    - If status `>= SHIPPED`: Show the Tracking Timeline (fetching from `GET /shipping/track/[id]`), displaying a vertical chronological log of shipping events.

## 3. API Data Mapping
- All pages must use `fetch` against the `admin-service` APIs (proxied via API Gateway at `PUBLIC_GATEWAY_URL/api/admin`).
- **Analytics:** `/api/admin/storefront/analytics`
- **Orders List:** `/api/admin/storefront/orders`
- **Order Detail:** `/api/admin/storefront/orders/[id]`
- **Carriers List:** `/api/admin/management/shipping/carriers`
- **Tracking Init:** `POST /api/admin/management/shipping/track`
- **Tracking Fetch:** `GET /api/storefront/shipping/track/[orderId]` (Note: this is on the storefront proxy path, or we can fetch it via the admin orders endpoint if included).

## 4. Verification Plan
- Verify styling matches Storefront (font weights, border radii, colors).
- Verify data is successfully fetched and rendered in the Overview metrics.
- Verify the Transactions table maps correct statuses to colored pills.
- Verify the Logistics form successfully creates a tracking record and updates the timeline.

# Panduan Hasil Analisis Audit

Dokumen ini merangkum dan menstrukturkan **hasil audit** agar mudah dibaca, ditindaklanjuti, dan dipantau. Lengkapi setiap bagian dengan temuan audit terbaru.

## 1. Informasi Audit
- **Tanggal Audit**: _[isi tanggal]_
- **Tim/Penanggung Jawab**: _[isi nama/tim]_
- **Ruang Lingkup**:
  - **api-gateway** (Port 8000)
  - **commerce-service** (Port 3001)
  - **admin-service** (Port 4001)
  - **customer-service**
  - **storefront-web** (Port 3000)
  - **admin-web** (Port 4000)
- **Metode Audit**: _[contoh: code review, dependency check, config review, runtime probing]_
- **Sumber Data**: _[link laporan atau lokasi file audit]_

## 2. Cara Membaca Tingkat Risiko
| Level | Makna | SLA Tindak Lanjut |
|---|---|---|
| **Critical** | Dampak sangat tinggi, eksploitasi mudah/aktif | 24–48 jam |
| **High** | Dampak tinggi, butuh perbaikan cepat | 3–7 hari |
| **Medium** | Dampak sedang, perlu dijadwalkan | 1–4 minggu |
| **Low** | Dampak rendah, perbaiki saat ada waktu | Backlog |

## 3. Ringkasan Eksekutif
_Tulis ringkasan singkat (3–6 poin) mengenai kondisi umum dan temuan utama._

- _[temuan utama #1]_
- _[temuan utama #2]_
- _[temuan utama #3]_

## 4. Rekap Temuan (Ringkas)
| Kategori | Critical | High | Medium | Low | Catatan |
|---|---:|---:|---:|---:|---|
| Security | _[n]_ | _[n]_ | _[n]_ | _[n]_ | _[catatan]_ |
| Reliability | _[n]_ | _[n]_ | _[n]_ | _[n]_ | _[catatan]_ |
| Performance | _[n]_ | _[n]_ | _[n]_ | _[n]_ | _[catatan]_ |
| Data Integrity | _[n]_ | _[n]_ | _[n]_ | _[n]_ | _[catatan]_ |
| UX/Operational | _[n]_ | _[n]_ | _[n]_ | _[n]_ | _[catatan]_ |

## 5. Temuan Detail per Layanan
Gunakan format konsisten agar mudah ditindaklanjuti.

### 5.1 api-gateway
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

### 5.2 commerce-service
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

### 5.3 admin-service
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

### 5.4 customer-service
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

### 5.5 storefront-web
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

### 5.6 admin-web
- **Temuan**: _[judul singkat]_
- **Dampak**: _[dampak ke bisnis/teknis]_
- **Level Risiko**: _[Critical/High/Medium/Low]_
- **Rekomendasi**: _[aksi yang disarankan]_
- **Owner**: _[nama/tim]_
- **Target Selesai**: _[tanggal]_

## 6. Rencana Tindak Lanjut
| Aksi | Prioritas | Owner | Target | Status |
|---|---|---|---|---|
| _[aksi #1]_ | _[Critical/High/Medium/Low]_ | _[nama/tim]_ | _[tanggal]_ | _[Open/In Progress/Done]_ |
| _[aksi #2]_ | _[Critical/High/Medium/Low]_ | _[nama/tim]_ | _[tanggal]_ | _[Open/In Progress/Done]_ |

## 7. Catatan & Risiko Residual
_Catat risiko yang belum bisa ditangani, dependensi eksternal, atau keputusan bisnis._

- _[catatan #1]_
- _[catatan #2]_

## 8. Lampiran (Opsional)
- Link ke laporan audit, bukti, atau hasil scanning.


## Recommended Open API Structure
# services/api-gateway/openapi.yaml
openapi: "3.1.0"
info:
  title: Novarium E-Commerce API Gateway
  version: "2.0.0"

servers:
  - url: https://api.novarium.id
    description: Production
  - url: http://localhost:8000
    description: Development

# ── Shared Schemas ─────────────────────────────────────────────────────────────
components:
  schemas:

    # Common response envelope (ALL endpoints must use this)
    ApiResponse:
      type: object
      required: [success]
      properties:
        success:
          type: boolean
        data:
          description: Present on success
        error:
          type: string
          description: Present on failure
        message:
          type: string

    # Pagination wrapper
    PaginatedResponse:
      allOf:
        - $ref: '#/components/schemas/ApiResponse'
        - type: object
          properties:
            data:
              type: object
              properties:
                items:
                  type: array
                total:
                  type: integer
                page:
                  type: integer
                pageSize:
                  type: integer

    Product:
      type: object
      required: [id, name, price, categoryId, inStock]
      properties:
        id:           { type: string }
        name:         { type: string }
        slug:         { type: string }
        description:  { type: string, nullable: true }
        price:        { type: number, format: float }
        image:        { type: array, items: { type: string, format: uri } }
        colors:       { type: array, items: { type: string } }
        sizeOptions:  { type: array, items: { type: string } }
        sizeStocks:   { type: array, items: { type: integer } }
        rating:       { type: number }
        inStock:      { type: boolean }
        category:
          type: object
          properties:
            id:   { type: string }
            name: { type: string }
        variants:
          type: array
          items: { $ref: '#/components/schemas/ProductVariant' }

    ProductVariant:
      type: object
      required: [id, productId, size, stock]
      properties:
        id:        { type: string }
        productId: { type: string }
        sku:       { type: string }
        size:      { type: string }
        color:     { type: string, nullable: true }
        stock:     { type: integer }
        price:     { type: number, nullable: true }

    CartItem:
      type: object
      properties:
        id:               { type: string }
        productId:        { type: string }
        productVariantId: { type: string }
        quantity:         { type: integer }
        product:          { $ref: '#/components/schemas/Product' }
        variant:          { $ref: '#/components/schemas/ProductVariant' }

    Order:
      type: object
      properties:
        id:            { type: string }
        customerId:    { type: string }
        totalAmount:   { type: number }
        shippingAmount:{ type: number, nullable: true }
        status:
          type: string
          enum: [AWAITING_PAYMENT, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED, REFUNDED]
        createdAt:     { type: string, format: date-time }
        items:
          type: array
          items: { $ref: '#/components/schemas/OrderItem' }

    OrderItem:
      type: object
      properties:
        id:               { type: string }
        productId:        { type: string }
        productVariantId: { type: string, nullable: true }
        quantity:         { type: integer }
        price:            { type: number }

    Customer:
      type: object
      properties:
        id:        { type: string }
        name:      { type: string }
        email:     { type: string, format: email }
        phone:     { type: string, nullable: true }
        createdAt: { type: string, format: date-time }

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    CookieAuth:
      type: apiKey
      in: cookie
      name: novarium_jwt

# ── Storefront Routes (/api/storefront) ────────────────────────────────────────
paths:

  /api/storefront/products:
    get:
      summary: List products
      tags: [Storefront - Catalog]
      parameters:
        - name: category
          in: query
          schema: { type: string }
        - name: q
          in: query
          schema: { type: string }
      responses:
        "200":
          description: Product list
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data:
                        type: array
                        items: { $ref: '#/components/schemas/Product' }

  /api/storefront/products/{id}:
    get:
      summary: Get product by ID
      tags: [Storefront - Catalog]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data: { $ref: '#/components/schemas/Product' }
        "404":
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ApiResponse' }

  /api/storefront/auth/login:
    post:
      summary: Customer login
      tags: [Storefront - Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:    { type: string, format: email }
                password: { type: string }
      responses:
        "200":
          description: Login successful; sets httpOnly novarium_jwt cookie
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data: { $ref: '#/components/schemas/Customer' }
        "401":
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ApiResponse' }

  /api/storefront/auth/me:
    get:
      summary: Get current session
      tags: [Storefront - Auth]
      security:
        - CookieAuth: []
        - BearerAuth: []
      responses:
        "200":
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data: { $ref: '#/components/schemas/Customer' }
        "401":
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ApiResponse' }

  /api/storefront/cart:
    get:
      summary: Get cart
      tags: [Storefront - Cart]
      security: [{ CookieAuth: [] }]
      responses:
        "200":
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data:
                        type: object
                        properties:
                          id: { type: string }
                          items:
                            type: array
                            items: { $ref: '#/components/schemas/CartItem' }
    post:
      summary: Add item to cart
      tags: [Storefront - Cart]
      security: [{ CookieAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [productId, productVariantId]
              properties:
                productId:        { type: string }
                productVariantId: { type: string }
                quantity:         { type: integer, default: 1 }
      responses:
        "200":
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ApiResponse' }

  /api/storefront/orders:
    get:
      summary: List customer orders
      tags: [Storefront - Orders]
      security: [{ CookieAuth: [] }]
      responses:
        "200":
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data:
                        type: array
                        items: { $ref: '#/components/schemas/Order' }

# ── Admin Routes (/api/admin) ──────────────────────────────────────────────────

  /api/admin/auth/login:
    post:
      summary: Admin login
      tags: [Admin - Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:    { type: string, format: email }
                password: { type: string }
      responses:
        "200":
          description: Sets httpOnly novarium_jwt admin cookie
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ApiResponse' }
        "401":
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ApiResponse' }

  /api/admin/storefront/products:
    get:
      summary: List products (admin)
      tags: [Admin - Catalog]
      security: [{ CookieAuth: [] }]
      parameters:
        - name: q
          in: query
          schema: { type: string }
        - name: category
          in: query
          schema: { type: string }
      responses:
        "200":
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data:
                        type: array
                        items: { $ref: '#/components/schemas/Product' }
    post:
      summary: Create product
      tags: [Admin - Catalog]
      security: [{ CookieAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, price, categoryId]
              properties:
                name:        { type: string }
                description: { type: string }
                price:       { type: number }
                stock:       { type: integer }
                categoryId:  { type: string }
                images:
                  type: array
                  items: { type: string, format: uri }
      responses:
        "201":
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ApiResponse' }

  /api/admin/storefront/orders:
    get:
      summary: List all orders (admin)
      tags: [Admin - Orders]
      security: [{ CookieAuth: [] }]
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [AWAITING_PAYMENT, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED, REFUNDED]
      responses:
        "200":
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data:
                        type: array
                        items: { $ref: '#/components/schemas/Order' }

  /api/admin/storefront/analytics:
    get:
      summary: Aggregated analytics
      tags: [Admin - Analytics]
      security: [{ CookieAuth: [] }]
      responses:
        "200":
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - properties:
                      data:
                        type: object
                        properties:
                          summary:
                            type: object
                            properties:
                              totalRevenue:     { type: number }
                              orderCount:       { type: integer }
                              revenueThisMonth: { type: number }
                              revenueGrowth:    { type: number }
                              aov:              { type: number }
                              newCustomers:     { type: integer }
                          finance:
                            type: object
                            properties:
                              grossProfit:    { type: number }
                              estimatedCOGS:  { type: number }
                              margin:         { type: number }
                          topProducts:
                            type: array
                            items:
                              type: object
                              properties:
                                productId: { type: string }
                                name:      { type: string }
                                quantity:  { type: integer }
                                revenue:   { type: number }
                          dailyData:
                            type: array
                            items: { type: number }
                            description: 30-element array of daily revenue


# Per-Service/App Findings
1. services/api-gateway — Partial gateway, not a full contract layer
File: services/api-gateway/index.ts

The gateway is a thin http-proxy-middleware reverse proxy. It does no request validation, no schema enforcement, and no response normalization. Key issues:

No authentication middleware. Auth is entirely delegated to downstream services. There is no centralized JWT verification or rate-limiting at the gateway (index.ts:82–114).
Hardcoded JWT secret exposed in docker-compose.yml. JWT_SECRET=novarium-super-secret-key-2026 appears in plain text at lines 17, 58, and 67.
Path rewrite inconsistency. Rule 4 rewrites /api/admin/auth → /api/admin/management/auth (index.ts:150–154), but rule 2 passes /api/admin/management through unchanged with a no-op rewrite (index.ts:130–134). This creates maintenance confusion. Rule 6 is also labeled twice ("6.") (index.ts:166,172).
No OpenAPI spec. There is no contract file in services/api-gateway/.
CORS allows all localhost origins indiscriminately: origin && origin.includes('localhost') at index.ts:25 bypasses the allowlist entirely for any localhost port.
2. apps/storefront-web — Mostly headless, with two concrete violations
Framework: Next.js 15 (App Router)

✅ What is headless
All product fetching in apps/storefront-web/src/frontend/lib/actions/catalogue.ts goes through NEXT_PUBLIC_API_URL (the gateway) → GET /api/storefront/products (lines 81–96). Server Actions are used, so no database imports exist in the frontend.
Auth calls (/auth/login, /auth/me, /auth/logout) go through the gateway (src/frontend/lib/auth.ts:16,38,51).
Cart calls go through the gateway (src/frontend/context/CartContext.tsx:44,53,77,103,125,152).
❌ Issue 1 — Supabase URL leaked into frontend next.config.ts
ts
// apps/storefront-web/next.config.ts:8–12
hostname: 'ghdadhlyhzdkrjlurifj.supabase.co',
The Supabase project hostname is hardcoded in the Next.js image config. While this is for <Image> optimization (not a DB bypass), it exposes the Supabase project ID to the public and couples the frontend to the storage backend.

❌ Issue 2 — Mock user data with plaintext passwords in source code
ts
// apps/storefront-web/src/frontend/lib/mock-users.ts:32–52
MOCK_USERS: [
  { email: "demo@novarium.com", password: "novarium123" },   // plaintext
  { email: "admin@novarium.com", password: "admin123" },   // plaintext
]
The comment explicitly says "plaintext for demo only — hash in production" but these credentials are committed to the repo. More critically, AuthContext.tsx:18 still imports from mock-users, meaning the type SessionUser is coupled to this file. The verifyCredentials() function (mock-users.ts:58–78) is never actually called (the real auth goes through the API), so this file is dead code that creates credential exposure risk.

❌ Issue 3 — JWT stored in localStorage
ts
// apps/storefront-web/src/frontend/lib/auth.ts:15,63
const token = localStorage.getItem("novarium_jwt");
localStorage.setItem("novarium_jwt", result.token);
localStorage is XSS-vulnerable. The correct pattern for a headless storefront is httpOnly cookie-only. CartContext.tsx also reads from localStorage at lines 52, 76, 100, 124, 151.

❌ Issue 4 — Direct third-party API call bypassing gateway
ts
// apps/storefront-web/src/frontend/lib/api/geography.ts:1
const BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";
The Indonesian regional address lookup calls an external API directly from the frontend. This creates an undocumented dependency on a third-party service with no retry/fallback logic.

3. apps/admin-web — Not fully headless; contains a direct Supabase client
Framework: SvelteKit

❌ Critical Issue — Direct Supabase client instantiated in the frontend
ts
// apps/admin-web/src/lib/supabase.ts:1–7
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
This is a direct database SDK client instantiated inside the admin frontend. It bypasses the API gateway entirely. Even though it uses the anon key (RLS-constrained), the existence of this client means:

The admin frontend has its own database access path undocumented in the gateway.
Any RLS misconfiguration would be exploitable from the browser.
This file should not exist if architecture is truly headless.
The docker-compose.yml at lines 94–95 passes PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY to the admin-web container, confirming this is live.

✅ What is headless
apps/admin-web/src/lib/config.ts correctly defines API_BASE_URL and INTERNAL_API_URL pointing at the gateway (config.ts:17–24).
All SvelteKit page loads (+page.server.ts) use fetch() against the gateway (products/+page.server.ts:8–14, orders/+page.server.ts:8–12, analytics/+page.server.ts:5, +page.server.ts:16–17).
hooks.server.ts does auth validation via the gateway (hooks.server.ts:13), not directly against the DB.
4. services/commerce-service — Headless API, but dual-mode architecture
Framework: Next.js 15 as an API-only service (no real frontend; app/page.tsx is a stub).

Exposes GET /api/products, GET /api/products/[id], POST/GET /api/admin/products, GET /api/admin/categories, GET /api/admin/analytics.
Uses Prisma directly against the commerce PostgreSQL DB (src/infrastructure/database/prisma.ts).
Issue: Commerce-service exposes both a public storefront path (/api/products) and an admin path (/api/admin/products). Neither path enforces authentication (app/api/products/route.ts:5–80, app/api/admin/products/route.ts:4–48). The admin product CRUD (POST) is completely open.
Issue: The docker-compose.yml passes NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as environment variables to commerce-service at build args (lines 27–30), but the service itself uses Prisma/PostgreSQL — these env vars appear unused and suggest unresolved architecture debt.
5. services/admin-service — SvelteKit service with mixed routing
Framework: SvelteKit (running as an API server, not a rendered app)

Routes are SvelteKit +server.ts files under src/routes/api/.

Auth is verified in src/hooks.server.ts via cookie+JWT, but only checks adminUser (hooks.server.ts:13). Unauthenticated requests to +server.ts endpoints are not blocked by a route-level guard — the hooks guard redirects to /login which is a page, not an error for API routes.
src/routes/api/admin/storefront/analytics/+server.ts calls commerce-service directly (bypassing the gateway) at COMMERCE_API_URL = process.env.COMMERCE_API_URL || 'http://localhost:3001/api/admin' (line 4). This is appropriate for service-to-service internal networking but is undocumented in gateway contracts.
src/application/services/cart.service.ts:44 also fetches product data via INTERNAL_API_URL = 'http://api-gateway:8000/api/admin/storefront' — routing through the gateway internally, creating a circular dependency risk.
Schema duplication: admin-service/prisma/schema.prisma contains the full Customer, Order, Cart, CartItem, ShippingTracking etc. — a complete copy of what customer-service/prisma/schema.prisma also owns. Both schemas are connected to the same ADMIN_DATABASE_URL (docker-compose.yml:44, 66), meaning admin-service and customer-service share a database but have separate schema files and separate Prisma clients. This is fragile.
6. services/customer-service — Mostly well-structured, one bypass concern
Framework: Express

Auth/cart/orders/checkout all go through proper Prisma + JWT middleware.
src/routes/cart.ts:9,16 — the customer-service fetches product data directly from commerce-service internally (COMMERCE_SERVICE_URL = 'http://commerce-service:3001'). This is a valid internal service call but is not documented in the gateway. The cart hydration (cart.ts:13–31) makes N+1 fetches (one per cart item) with no batching.
src/middleware/auth.ts:4 — JWT_SECRET defaults to 'novarium-super-secret-key-2026', same as in all other services and exposed in docker-compose. All services share one secret with no rotation strategy.
src/routes/checkout.ts:143–165 — the Midtrans webhook handler at POST /midtrans/notification performs no signature verification. Midtrans signs payloads with a SHA512 hash; ignoring it allows spoofed payment notifications.
Summary of Headless Violations
#	Location	Issue	Severity
1	apps/admin-web/src/lib/supabase.ts:1–7	Direct Supabase SDK client in frontend (DB bypass)	Critical
2	apps/storefront-web/src/frontend/lib/mock-users.ts:32–52	Plaintext passwords committed to source	High
3	apps/storefront-web/src/frontend/lib/auth.ts:15,63	JWT in localStorage (XSS-vulnerable)	High
4	services/customer-service/src/routes/checkout.ts:143	Midtrans webhook without signature verification	High
5	services/commerce-service/app/api/admin/products/route.ts:27	Admin product mutation endpoint has no auth guard	High
6	docker-compose.yml:17,58,67	Hardcoded JWT secret in docker-compose	High
7	apps/admin-web/src/lib/supabase.ts	PUBLIC_SUPABASE_ANON_KEY exposed to browser in admin app	Medium
8	apps/storefront-web/src/frontend/lib/api/geography.ts:1	Direct third-party API call bypassing gateway	Medium
9	services/admin-service/src/application/services/cart.service.ts:4	Circular: admin-service → gateway → admin-service	Medium
10	admin-service + customer-service	Shared database, duplicate Prisma schemas	Medium
11	services/api-gateway/index.ts:25	CORS allows all localhost origins unconditionally	Low
12	apps/storefront-web/next.config.ts:11	Supabase project hostname hardcoded in public config	Low
Step-by-Step Migration Roadmap to Fully Headless Architecture
Phase 1: Security Hardening (Immediate)
Remove apps/admin-web/src/lib/supabase.ts entirely. Replace all usages (audit via grep -r 'supabase' in apps/admin-web/) with gateway API calls. All admin reads/writes for Supabase data must go through commerce-service → gateway.
Delete apps/storefront-web/src/frontend/lib/mock-users.ts. Remove the import in AuthContext.tsx:18. The SessionUser type should be defined inline or in a shared types package.
Rotate the JWT secret (novarium-super-secret-key-2026 appears in docker-compose.yml:17,58,67 and hardcoded in customer-service/src/middleware/auth.ts:4, admin-service/src/hooks.server.ts:5). Move to a proper JWT_SECRET env var injected only at runtime, never in source code.
Implement Midtrans webhook signature verification in customer-service/src/routes/checkout.ts:138. Validate signature_key = SHA512(order_id + status_code + gross_amount + server_key) per Midtrans docs.
Add auth middleware to commerce-service admin routes (app/api/admin/products/route.ts, app/api/admin/categories, app/api/admin/analytics). Check a service-level API key or forward the admin JWT from the gateway.
Phase 2: Gateway Authentication Centralization
Add centralized JWT verification middleware in the gateway (services/api-gateway/index.ts). Verify the novarium_jwt cookie / Authorization: Bearer header before proxying to any protected route. Remove per-service auth for routes that go through the gateway (storefront cart, orders, account).
Move localStorage JWT storage to httpOnly cookies in storefront-web. Update loginUser (auth.ts:63) to rely solely on the set-cookie response header; remove all localStorage.getItem("novarium_jwt") reads from CartContext.tsx and auth.ts.
Proxy the geography API through the gateway (add a new route /api/storefront/geography that fetches from emsifa). Update geography.ts:1 to point at the gateway.
Phase 3: Schema and Database Consolidation
Merge admin-service and customer-service Prisma schemas into one authoritative schema. Since both services use the same ADMIN_DATABASE_URL, either:
Merge into one service (simpler, recommended given current scale), or
Establish one schema owner and import a shared schema package.
Remove the commerce-service Supabase env vars from docker-compose.yml:27–30,85–86 if they are unused. Audit commerce-service source for any remaining @supabase/supabase-js imports.
Phase 4: Service Mesh Cleanup
Fix the circular dependency in admin-service/src/application/services/cart.service.ts:44: the admin-service should call commerce-service directly (as it already does for analytics), not go through the gateway back to itself.
Fix N+1 in cart hydration (customer-service/src/routes/cart.ts:52–65). Replace per-item fetches with a batch endpoint GET /api/products?ids=id1,id2,... in commerce-service.
Phase 5: API Contract Formalization
Add an OpenAPI 3.1 spec to services/api-gateway/ (see recommended structure below).
Generate TypeScript types from the spec for use in all frontend apps.


# Recommended Folder Structure

.
├─ apps/
│  ├─ storefront-web/
│  │  ├─ public/
│  │  │  ├─ images/
│  │  │  └─ icons/
│  │  ├─ src/
│  │  │  ├─ app/                     # Next.js app router
│  │  │  │  ├─ (routes)/
│  │  │  │  │  ├─ page.tsx
│  │  │  │  │  ├─ products/
│  │  │  │  │  │  ├─ page.tsx
│  │  │  │  │  │  └─ [slug]/
│  │  │  │  │  │     └─ page.tsx
│  │  │  │  │  ├─ cart/
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  └─ checkout/
│  │  │  │  │     └─ page.tsx
│  │  │  │  ├─ api/                   # optional (edge/route handlers)
│  │  │  │  └─ layout.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ atoms/
│  │  │  │  ├─ molecules/
│  │  │  │  └─ organisms/
│  │  │  ├─ features/
│  │  │  │  ├─ catalog/
│  │  │  │  ├─ cart/
│  │  │  │  └─ checkout/
│  │  │  ├─ hooks/
│  │  │  ├─ lib/
│  │  │  │  ├─ api/                   # gateway client
│  │  │  │  ├─ auth/
│  │  │  │  └─ utils/
│  │  │  ├─ styles/
│  │  │  └─ types/
│  │  └─ package.json
│  │
│  └─ admin-web/
│     ├─ static/
│     │  ├─ images/
│     │  └─ icons/
│     ├─ src/
│     │  ├─ routes/
│     │  │  ├─ +layout.svelte
│     │  │  ├─ +page.svelte
│     │  │  ├─ products/
│     │  │  │  └─ +page.svelte
│     │  │  ├─ orders/
│     │  │  │  └─ +page.svelte
│     │  │  └─ customers/
│     │  │     └─ +page.svelte
│     │  ├─ components/
│     │  │  ├─ atoms/
│     │  │  ├─ molecules/
│     │  │  └─ organisms/
│     │  ├─ features/
│     │  │  ├─ catalog/
│     │  │  ├─ order/
│     │  │  └─ customer/
│     │  ├─ lib/
│     │  │  ├─ api/                   # gateway client
│     │  │  ├─ auth/
│     │  │  └─ utils/
│     │  ├─ styles/
│     │  └─ types/
│     └─ package.json
│
├─ services/
│  ├─ api-gateway/
│  │  ├─ src/
│  │  │  ├─ app.ts
│  │  │  ├─ routes/
│  │  │  │  ├─ storefront/            # BFF storefront
│  │  │  │  │  ├─ catalog.routes.ts
│  │  │  │  │  ├─ cart.routes.ts
│  │  │  │  │  └─ checkout.routes.ts
│  │  │  │  └─ admin/                 # BFF admin
│  │  │  │     ├─ products.routes.ts
│  │  │  │     ├─ orders.routes.ts
│  │  │  │     └─ users.routes.ts
│  │  │  ├─ middlewares/
│  │  │  │  ├─ auth.ts
│  │  │  │  ├─ cors.ts
│  │  │  │  ├─ rate-limit.ts
│  │  │  │  └─ error-handler.ts
│  │  │  ├─ proxies/
│  │  │  │  ├─ commerce.proxy.ts
│  │  │  │  └─ admin.proxy.ts
│  │  │  ├─ utils/
│  │  │  └─ types/
│  │  ├─ config/
│  │  │  ├─ env.ts
│  │  │  └─ routes.ts
│  │  └─ package.json
│  │
│  ├─ commerce-service/
│  │  ├─ src/
│  │  │  ├─ app.ts
│  │  │  ├─ modules/
│  │  │  │  ├─ product/
│  │  │  │  │  ├─ product.controller.ts
│  │  │  │  │  ├─ product.service.ts
│  │  │  │  │  ├─ product.repository.ts
│  │  │  │  │  ├─ product.routes.ts
│  │  │  │  │  └─ product.schema.ts
│  │  │  │  ├─ category/
│  │  │  │  └─ review/
│  │  │  ├─ db/
│  │  │  │  ├─ prisma/
│  │  │  │  │  ├─ schema.prisma
│  │  │  │  │  └─ migrations/
│  │  │  │  └─ client.ts
│  │  │  ├─ middlewares/
│  │  │  └─ utils/
│  │  ├─ config/
│  │  └─ package.json
│  │
│  └─ admin-service/
│     ├─ src/
│     │  ├─ app.ts
│     │  ├─ modules/
│     │  │  ├─ order/
│     │  │  │  ├─ order.controller.ts
│     │  │  │  ├─ order.service.ts
│     │  │  │  ├─ order.repository.ts
│     │  │  │  ├─ order.routes.ts
│     │  │  │  └─ order.schema.ts
│     │  │  ├─ cart/
│     │  │  ├─ customer/
│     │  │  └─ staff/
│     │  ├─ db/
│     │  │  ├─ prisma/
│     │  │  │  ├─ schema.prisma
│     │  │  │  └─ migrations/
│     │  │  └─ client.ts
│     │  ├─ middlewares/
│     │  └─ utils/
│     ├─ config/
│     └─ package.json
│
├─ packages/
│  ├─ contracts/
│  │  ├─ openapi/
│  │  │  ├─ storefront.yaml
│  │  │  ├─ admin.yaml
│  │  │  └─ common.yaml
│  │  ├─ schemas/
│  │  │  ├─ product.schema.ts
│  │  │  ├─ order.schema.ts
│  │  │  └─ customer.schema.ts
│  │  └─ index.ts
│  ├─ ui/
│  │  ├─ src/
│  │  │  ├─ atoms/
│  │  │  ├─ molecules/
│  │  │  └─ organisms/
│  │  └─ package.json
│  └─ utils/
│     ├─ src/
│     │  ├─ logger/
│     │  ├─ errors/
│     │  ├─ http/
│     │  └─ auth/
│     └─ package.json
│
├─ docs/
│  ├─ architecture/
│  │  ├─ overview.md
│  │  ├─ services.md
│  │  └─ data-flow.md
│  ├─ api/
│  │  ├─ storefront.md
│  │  └─ admin.md
│  └─ deployment/
│     ├─ docker.md
│     └─ k8s.md
│
├─ infra/
│  ├─ docker/
│  │  ├─ api-gateway.Dockerfile
│  │  ├─ commerce-service.Dockerfile
│  │  ├─ admin-service.Dockerfile
│  │  ├─ storefront-web.Dockerfile
│  │  └─ admin-web.Dockerfile
│  ├─ k8s/
│  │  ├─ namespace.yaml
│  │  ├─ api-gateway/
│  │  │  ├─ deployment.yaml
│  │  │  └─ service.yaml
│  │  ├─ commerce-service/
│  │  ├─ admin-service/
│  │  ├─ storefront-web/
│  │  └─ admin-web/
│  └─ terraform/
│     ├─ supabase.tf
│     ├─ neon.tf
│     └─ dns.tf
│
├─ scripts/
│  ├─ dev/
│  │  ├─ start-all.sh
│  │  └─ stop-all.sh
│  └─ db/
│     ├─ migrate-commerce.sh
│     └─ migrate-admin.sh
│
├─ .env.example
├─ docker-compose.yml
├─ README.md
└─ package.json
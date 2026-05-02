# Customer API Service & Global JWT Migration Design

## 1. Overview
The current architecture relies on `admin-service` (a SvelteKit application) to handle frontend (Storefront) API requests. This causes issues because SvelteKit imposes strict CSRF and origin checks, breaking POST requests from Next.js, and cookies are not propagating correctly across domains. 

To fix this and adhere to microservice principles, we are introducing a dedicated `customer-api-service` (Express.js) to handle all Storefront logic (cart, checkout, profile, auth) against the Neon database. Furthermore, to ensure seamless synchronization between all services, we will replace the current cookie-based session ID (`novure_uid`) with a universally accepted JSON Web Token (JWT) strategy.

## 2. Architecture & Data Flow
- **Storefront Web (Next.js):** Communicates exclusively with `http://localhost:8000/api/storefront/*`.
- **Admin Web (SvelteKit):** Communicates exclusively with `http://localhost:8000/api/admin/management/*`.
- **API Gateway (Express.js):** 
  - Routes `/api/storefront/products` -> `commerce-service:3001`
  - Routes `/api/storefront/*` -> `customer-api-service:4002`
  - Routes `/api/admin/management/*` -> `admin-service:4001`
- **Customer API Service (Express.js - NEW):** 
  - Connects to Neon DB (Prisma).
  - Issues JWTs on Login/Register.
  - Validates JWTs for Cart, Profile, and Checkout operations.
- **Admin Service (SvelteKit - MODIFIED):**
  - Connects to Neon DB (Prisma).
  - Modified to issue and validate JWTs for staff/manager logins instead of raw session IDs.
- **Commerce Service (Next.js):** 
  - Connects to Supabase DB (Prisma).
  - Continues to serve catalog data.

## 3. JWT Strategy (Universal Authentication)
- **Token Format:** standard JWT containing `{ sub: userId, role: "CUSTOMER" | "ADMIN" }`.
- **Secret:** A shared `JWT_SECRET` environment variable must be injected into all services (`customer-api`, `admin-service`, and `api-gateway` if needed).
- **Delivery:** 
  - Tokens will be returned in the JSON payload on successful login (`{ success: true, token: "ey..." }`).
  - The frontend (Next.js/SvelteKit) is responsible for storing the token (e.g., localStorage or an HttpOnly cookie managed by their respective backend-for-frontend).
  - API requests must include the header: `Authorization: Bearer <token>`.

## 4. Components to Build / Modify

### 4.1. New Service: `customer-api-service` (Express.js + Prisma)
- **Scaffolding:** Initialize `package.json`, `tsconfig.json`, `Dockerfile`.
- **Database:** Copy the `schema.prisma` from `admin-service` to connect to Neon DB.
- **Endpoints:**
  - `POST /api/storefront/auth/login` (Returns JWT)
  - `POST /api/storefront/auth/register` (Returns JWT)
  - `GET /api/storefront/auth/me` (Validates JWT, returns user data)
  - `GET/POST /api/storefront/account` (Handles Address/Payment modifications)
  - `GET/POST /api/storefront/cart` (Handles Cart operations)
  - `POST /api/storefront/checkout/midtrans` (Creates transactions)

### 4.2. API Gateway Updates
- Reroute all `/api/storefront/*` traffic (except products/shipping) to the new `http://customer-api-service:4002`.

### 4.3. Admin Service Updates
- **Auth Endpoints:** Refactor `src/routes/api/admin/management/auth/login/+server.ts` to generate a JWT instead of a raw session cookie.
- **Middleware:** Update `hooks.server.ts` or endpoint guards to verify the JWT Bearer token.

### 4.4. Storefront Web Updates
- **Auth Context (`auth.ts` / `ProfileDataContext.tsx`):** Ensure the frontend captures the JWT from the login response and attaches it as an `Authorization: Bearer` header on all subsequent fetch requests.

## 5. Success Criteria
1. The new `customer-api-service` successfully boots and connects to the Neon DB.
2. The API Gateway routes traffic correctly to the new service.
3. A user can register, log in, and receive a JWT.
4. A user can save addresses and payment methods using the JWT authorization.
5. The SvelteKit `admin-service` successfully authenticates staff using the same JWT mechanism.
6. CSRF and 401 Unauthorized errors are completely eliminated from the Storefront-to-Backend communication flow.
# Database Swap and Schema Refinements Design

## 1. Objective
Swap the current database connections: Admin Management API will use **Neon** (pure Postgres), while Core Commerce API (Storefront) will use **Supabase**. Additionally, refine the schemas for both systems to fully support existing UI features and ensure logical data separation.

## 2. Architecture & Databases

### 2.1 Admin Management DB (Neon)
*Focus: Internal Operations, Staff Management, and Finances.*

- **Authentication**: Transition from Supabase Auth to Custom JWT Auth. Token will be stored in an HttpOnly Cookie by the SvelteKit frontend.
- **Schema Adjustments**:
  - Keep: `AdminUser`, `AuditLog`, `SystemConfig`.
  - Remove: `Banner`, `Voucher` (moved to Storefront).
  - Add `AdminNotification`: Internal alerts for staff (e.g., low stock, new order).
  - Add `ReportJob`: Async job tracking for data exports (e.g., monthly sales).
  - Add `Supplier`, `PurchaseOrder`, `PurchaseOrderItem`: Manage supply chain and restocking.
  - Add `FinancialTransaction`: Centralized tracking of all income (Orders) and expenses (Refunds, Supplier POs).

### 2.2 Core Commerce DB (Supabase)
*Focus: Customer-Facing E-Commerce, Catalogue, and Orders.*

- **Authentication**: Remain on Custom Auth (JWT/Bcrypt), storing users in the Prisma `Customer` table. (Supabase Auth is not used for Customers).
- **Schema Adjustments**:
  - Keep: `Customer`, `Product`, `Category`, `ProductVariant`, `Order`, `OrderItem`, `Cart`, `CartItem`, `Review`, `Address`, `WishlistItem`.
  - Add (Moved from Admin): `Banner`, `Voucher`.
  - Add `CustomerNotification`: System notifications for customers (used in Profile UI).
  - Add `CustomerVoucher`: Link between `Customer` and `Voucher` to track claimed/owned vouchers (used in Profile UI).
  - Add `SavedPaymentMethod`: To store customer payment preferences (used in Profile UI).
  - Add `ReturnRequest`: To handle product returns and refunds from customers.
  - Update `Review`: Add `adminReply` field.
  - Update `OrderStatus` Enum: Add `RETURNED` and `REFUNDED`.

## 3. Data Flow & Integration
- **Admin Dashboard**: Will no longer use `@supabase/supabase-js` for Auth. It will call `/api/auth/login` on the Admin Management API to receive a JWT. It will continue to use Supabase Storage for uploading images.
- **Admin Management API**: Will connect to Neon via Prisma. It will manage Storefront entities (Products, Orders, Banners) either by routing requests to the Core Commerce API through the Gateway, or by utilizing a secondary Prisma client. (Recommendation: Let Storefront API handle all Storefront DB writes, and Admin API calls Storefront API for those).
- **Environment Variables**: `CORE_DATABASE_URL` will map to Supabase, and `ADMIN_DATABASE_URL` will map to Neon.

## 4. Migration Strategy
1. Backup any necessary test data.
2. Update `.env` files to swap connection strings.
3. Update `prisma/schema.prisma` in both repositories according to the design.
4. Generate new Prisma clients (`npx prisma generate`).
5. Run migrations (`npx prisma db push` or `migrate dev` to sync schemas with the fresh databases).
6. Implement the Custom Auth in Admin Management API and refactor Admin Dashboard to remove Supabase Auth.
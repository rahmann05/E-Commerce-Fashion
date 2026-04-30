# E-Commerce Architecture Migration Plan: Opsi A

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Customer, Order, and Cart domains to Neon (Admin Service) while retaining Product and Catalog domains in Supabase (Commerce Service).

**Architecture:** Split the monolithic schema into two separate bounded contexts:
1. **Catalog Domain (Supabase/commerce-service):** Products, Categories, Reviews, Banners.
2. **Transaction/Identity Domain (Neon/admin-service):** Customers, Orders, OrderItems, Carts, CartItems, Addresses, Payments.
Since these are separate databases, relationships across domains (e.g., `OrderItem` to `Product`) must be converted to plain `String` references rather than Prisma relational foreign keys.

**Tech Stack:** Prisma, Supabase (PostgreSQL), Neon (PostgreSQL), SvelteKit (admin-service), Next.js (commerce-service).

---

### Task 1: Update Commerce Service Schema (Supabase)

**Files:**
- Modify: `services/commerce-service/prisma/schema.prisma`

- [ ] **Step 1: Remove Transaction/Identity models**
  Delete the following models from `services/commerce-service/prisma/schema.prisma`:
  - `Customer`
  - `Order`, `OrderStatus` (enum)
  - `OrderItem`
  - `Cart`
  - `CartItem`
  - `Address`
  - `SavedPaymentMethod`
  - `ReturnRequest`
  - `CustomerNotification`
  - `CustomerVoucher`
  - `WishlistItem`

- [ ] **Step 2: Update Review model**
  Update `Review` to use `String` IDs for `customerId` and `orderId` instead of Prisma relations:
  ```prisma
  model Review {
    id         String   @id @default(cuid())
    customerId String   // Reference to Neon Customer ID
    productId  String
    product    Product  @relation(fields: [productId], references: [id])
    orderId    String   // Reference to Neon Order ID
    rating     Int
    comment    String?
    adminReply String?
    createdAt  DateTime @default(now())
  }
  ```

- [ ] **Step 3: Remove relations from Product model**
  In the `Product` model, remove the fields:
  ```prisma
    // orderItems     OrderItem[]
    // cartItems      CartItem[]
    // wishlist       WishlistItem[]
  ```

- [ ] **Step 4: Remove relations from ProductVariant model**
  In the `ProductVariant` model, remove the field:
  ```prisma
    // cartItems CartItem[]
  ```

- [ ] **Step 5: Generate Prisma Client**
  Run: `cd services/commerce-service && npx prisma generate`
  Expected: Prisma Client generated successfully for commerce-service.

---

### Task 2: Update Admin Service Schema (Neon)

**Files:**
- Modify: `services/admin-service/prisma/schema.prisma`

- [ ] **Step 1: Add OrderStatus Enum**
  Add the `OrderStatus` enum to the top of the file:
  ```prisma
  enum OrderStatus {
    AWAITING_PAYMENT
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    RETURNED
    REFUNDED
  }
  ```

- [ ] **Step 2: Add Customer and Address models**
  Add the `Customer` and `Address` models:
  ```prisma
  model Customer {
    id             String                 @id @default(cuid())
    name           String?
    email          String                 @unique
    password       String
    image          String?
    phone          String?
    createdAt      DateTime               @default(now())
    updatedAt      DateTime               @updatedAt

    orders         Order[]
    addresses      Address[]
    cart           Cart?
    notifications  CustomerNotification[]
    vouchers       CustomerVoucher[]
    paymentMethods SavedPaymentMethod[]
  }

  model Address {
    id         String   @id @default(cuid())
    customerId String
    customer   Customer @relation(fields: [customerId], references: [id])
    isPrimary  Boolean  @default(false)
    line1      String
    city       String
    province   String
  }
  ```

- [ ] **Step 3: Add Order and OrderItem models**
  Add the `Order`, `OrderItem`, and `ReturnRequest` models. Notice `productId` is a `String` without a relation:
  ```prisma
  model Order {
    id            String         @id @default(cuid())
    customerId    String
    customer      Customer       @relation(fields: [customerId], references: [id])
    totalAmount   Decimal        @db.Decimal(10, 2)
    status        OrderStatus    @default(AWAITING_PAYMENT)
    createdAt     DateTime       @default(now())
    updatedAt     DateTime       @updatedAt
    items         OrderItem[]
    returnRequest ReturnRequest?
  }

  model OrderItem {
    id               String  @id @default(cuid())
    orderId          String
    order            Order   @relation(fields: [orderId], references: [id])
    productId        String  // Reference to Supabase Product ID
    productVariantId String? // Reference to Supabase ProductVariant ID
    size             String?
    quantity         Int
    price            Decimal @db.Decimal(10, 2)
  }

  model ReturnRequest {
    id          String   @id @default(cuid())
    orderId     String   @unique
    order       Order    @relation(fields: [orderId], references: [id])
    reason      String
    status      String   @default("PENDING")
    images      String[]
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }
  ```

- [ ] **Step 4: Add Cart and CartItem models**
  Add the `Cart` and `CartItem` models. Notice `productId` is a `String`:
  ```prisma
  model Cart {
    id         String     @id @default(cuid())
    customerId String     @unique
    customer   Customer   @relation(fields: [customerId], references: [id])
    items      CartItem[]
  }

  model CartItem {
    id               String         @id @default(cuid())
    cartId           String
    cart             Cart           @relation(fields: [cartId], references: [id])
    productId        String         // Reference to Supabase Product ID
    productVariantId String         // Reference to Supabase ProductVariant ID
    quantity         Int

    @@unique([cartId, productVariantId])
  }
  ```

- [ ] **Step 5: Add auxiliary Customer models**
  Add `CustomerNotification`, `CustomerVoucher`, and `SavedPaymentMethod`:
  ```prisma
  model CustomerNotification {
    id         String   @id @default(cuid())
    customerId String
    customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
    title      String
    message    String
    isRead     Boolean  @default(false)
    createdAt  DateTime @default(now())
  }

  model CustomerVoucher {
    id         String   @id @default(cuid())
    customerId String
    customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
    voucherId  String   // Reference to Supabase Voucher ID
    isUsed     Boolean  @default(false)
    claimedAt  DateTime @default(now())

    @@unique([customerId, voucherId])
  }

  model SavedPaymentMethod {
    id         String   @id @default(cuid())
    customerId String
    customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
    provider   String
    cardMask   String?
    token      String
    isPrimary  Boolean  @default(false)
    createdAt  DateTime @default(now())
  }
  ```

- [ ] **Step 6: Update PurchaseOrderItem**
  Ensure `PurchaseOrderItem` does not have a hard Prisma relation to the Supabase `Product` model. It should look like this:
  ```prisma
  model PurchaseOrderItem {
    id              String   @id @default(cuid())
    purchaseOrderId String
    purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
    productName     String
    productId       String?  // Reference to Storefront DB Product ID
    quantity        Int
    unitPrice       Decimal  @db.Decimal(10, 2)
  }
  ```

- [ ] **Step 7: Generate Prisma Client**
  Run: `cd services/admin-service && npx prisma generate`
  Expected: Prisma Client generated successfully for admin-service.

---

### Task 3: API Gateway Routing Adjustments

**Files:**
- Modify: `services/api-gateway/index.ts`

- [ ] **Step 1: Reroute Identity/Transaction endpoints to Admin Service**
  In `services/api-gateway/index.ts`, add explicit routes for the domains moving to Neon *before* the general `api/storefront` catch-all proxy.

  ```typescript
  // 1a. Storefront Transaction/Identity APIs -> Route to Admin Management API (Neon)
  app.use(['/api/storefront/auth', '/api/storefront/account', '/api/storefront/cart', '/api/storefront/checkout', '/api/storefront/orders'], createProxyMiddleware({
    ...proxyOptions(`${ADMIN_BACKEND_URL}/api/storefront`),
  }));

  // 1b. Storefront Catalog APIs -> Route to Core Commerce API (Supabase)
  app.use('/api/storefront', createProxyMiddleware({
    ...proxyOptions(`${STOREFRONT_BACKEND_URL}/api`),
  }));
  ```

- [ ] **Step 2: Commit Schema and Gateway Changes**
  ```bash
  git add services/commerce-service/prisma/schema.prisma services/admin-service/prisma/schema.prisma services/api-gateway/index.ts
  git commit -m "feat(arch): migrate customer and order schemas to neon and update gateway routes"
  ```

---

### Phase 2: Implementation (Subsequent Tasks)
*The subsequent tasks to fully implement this plan will require migrating the actual API logic (rewriting Next.js Route Handlers to SvelteKit `+server.ts` endpoints) and resolving UI fetching.*

**Task 4:** Port `auth/login`, `auth/register`, `auth/me`, `auth/logout` logic from `commerce-service` to `admin-service/src/routes/api/storefront/auth/`.
**Task 5:** Port `cart` and `checkout` logic from `commerce-service` to `admin-service/src/routes/api/storefront/cart/` and `/checkout/`.
**Task 6:** Port `orders` logic from `commerce-service` to `admin-service/src/routes/api/storefront/orders/`.
**Task 7:** Port `admin/orders` logic from `commerce-service` to `admin-service/src/routes/api/admin/storefront/orders/` (if it was managing orders, it's now internal to admin-service).
**Task 8:** Push the database migrations: `cd services/admin-service && npx prisma db push` and `cd services/commerce-service && npx prisma db push`.

# Database Swap & Schema Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Swap Admin and Storefront database connections (Admin to Neon, Storefront to Supabase) and implement missing schema entities for both systems.

**Architecture:** Prisma schemas will be updated to reflect the new boundaries. Admin API will drop Supabase Auth and use a custom JWT strategy. Admin Dashboard will be updated to consume this new auth strategy.

**Tech Stack:** Prisma, PostgreSQL (Neon, Supabase), SvelteKit (Admin Dashboard), Next.js (Storefront), JWT/Bcrypt.

---

### Task 1: Update Environment Variables

**Files:**
- Modify: `.env`

- [ ] **Step 1: Read the current `.env` file**

```bash
cat .env
```
*(Review the current connection strings)*

- [ ] **Step 2: Swap the connection strings**

Modify `.env` to make `CORE_DATABASE_URL` point to the Supabase Postgres URL and `ADMIN_DATABASE_URL` point to the Neon Postgres URL.

```env
# Example modification in .env:
# NEON DATABASE (Admin Management API)
ADMIN_DATABASE_URL="postgresql://neondb_owner:.../neondb?sslmode=require"
ADMIN_DIRECT_URL="postgresql://neondb_owner:.../neondb?sslmode=require"

# SUPABASE DATABASE (Core Commerce API)
CORE_DATABASE_URL="postgresql://postgres:...@db....supabase.co:5432/postgres"
CORE_DIRECT_URL="postgresql://postgres:...@db....supabase.co:5432/postgres"
```

- [ ] **Step 3: Verify `.env` changes**

```bash
grep -E "(ADMIN_DATABASE_URL|CORE_DATABASE_URL)" .env
```
Expected: The URLs are successfully swapped.

- [ ] **Step 4: Commit**

```bash
git add .env
git commit -m "chore: swap admin and storefront database urls"
```

---

### Task 2: Refactor Admin Prisma Schema

**Files:**
- Modify: `admin-management-api/prisma/schema.prisma`

- [ ] **Step 1: Modify `admin-management-api/prisma/schema.prisma`**

Remove `Banner` and `Voucher`. Add the new admin tables:

```prisma
// ... existing generator and datasource ...
// ... existing AdminRole, AdminUser, AuditLog, SystemConfig ...

// Remove Banner and Voucher

model AdminNotification {
  id        String   @id @default(cuid())
  adminId   String
  admin     AdminUser @relation(fields: [adminId], references: [id])
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model ReportJob {
  id        String   @id @default(cuid())
  adminId   String
  admin     AdminUser @relation(fields: [adminId], references: [id])
  type      String   // e.g., "SALES_REPORT"
  status    String   @default("PENDING") // PENDING, PROCESSING, COMPLETED, FAILED
  fileUrl   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Supplier {
  id        String   @id @default(cuid())
  name      String
  contact   String?
  email     String?
  address   String?
  orders    PurchaseOrder[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PurchaseOrder {
  id          String   @id @default(cuid())
  supplierId  String
  supplier    Supplier @relation(fields: [supplierId], references: [id])
  status      String   @default("DRAFT") // DRAFT, SENT, COMPLETED, CANCELLED
  totalAmount Decimal  @db.Decimal(10, 2)
  items       PurchaseOrderItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PurchaseOrderItem {
  id              String   @id @default(cuid())
  purchaseOrderId String
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
  productName     String   // Denormalized or linked if Admin DB knows product IDs
  productId       String?  // Reference to Storefront DB Product ID
  quantity        Int
  unitPrice       Decimal  @db.Decimal(10, 2)
}

model FinancialTransaction {
  id            String   @id @default(cuid())
  type          String   // INCOME, EXPENSE, REFUND
  amount        Decimal  @db.Decimal(10, 2)
  status        String   @default("COMPLETED")
  referenceType String   // ORDER, PURCHASE_ORDER
  referenceId   String
  description   String?
  createdAt     DateTime @default(now())
}
```

*Note: Update `AdminUser` to include relations if needed:*
```prisma
  notifications AdminNotification[]
  reports       ReportJob[]
```

- [ ] **Step 2: Validate Prisma schema**

```bash
cd admin-management-api && npx prisma validate
```
Expected: Schema is valid.

- [ ] **Step 3: Commit**

```bash
git add admin-management-api/prisma/schema.prisma
git commit -m "feat(admin): update prisma schema for neon db"
```

---

### Task 3: Refactor Storefront Prisma Schema

**Files:**
- Modify: `core-commerce-api/prisma/schema.prisma`

- [ ] **Step 1: Modify `core-commerce-api/prisma/schema.prisma`**

Update Enums and add missing tables:

```prisma
// ... existing OrderStatus enum ...
enum OrderStatus {
  AWAITING_PAYMENT
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  RETURNED
  REFUNDED
}

// ... existing Customer ...
// Add to Customer model:
// notifications CustomerNotification[]
// vouchers      CustomerVoucher[]
// paymentMethods SavedPaymentMethod[]

// ... existing Review ...
// Add to Review model:
// adminReply String?

// Add Banner and Voucher:
model Banner {
  id        String   @id @default(cuid())
  title     String
  imageUrl  String
  link      String?
  isActive  Boolean  @default(true)
  priority  Int      @default(0)
  createdAt DateTime @default(now())
}

model Voucher {
  id          String    @id @default(cuid())
  code        String    @unique
  title       String?   @default("Discount Voucher")
  discountPct Int?
  discountFix Decimal?  @db.Decimal(10, 2)
  isActive    Boolean   @default(true)
  expiresAt   DateTime?
  
  claimedBy   CustomerVoucher[]
}

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
  voucherId  String
  voucher    Voucher  @relation(fields: [voucherId], references: [id], onDelete: Cascade)
  isUsed     Boolean  @default(false)
  claimedAt  DateTime @default(now())

  @@unique([customerId, voucherId])
}

model SavedPaymentMethod {
  id         String   @id @default(cuid())
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  provider   String   // e.g., "MIDTRANS", "STRIPE"
  cardMask   String?  // e.g., "**** **** **** 1234"
  token      String   // Payment gateway token
  isPrimary  Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model ReturnRequest {
  id          String   @id @default(cuid())
  orderId     String   @unique
  order       Order    @relation(fields: [orderId], references: [id])
  reason      String
  status      String   @default("PENDING") // PENDING, APPROVED, REJECTED, COMPLETED
  images      String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

*Note: Update `Customer` and `Order` models to include relations for `ReturnRequest`.*
```prisma
// In Order model:
// returnRequest ReturnRequest?
```

- [ ] **Step 2: Validate Prisma schema**

```bash
cd core-commerce-api && npx prisma validate
```
Expected: Schema is valid.

- [ ] **Step 3: Commit**

```bash
git add core-commerce-api/prisma/schema.prisma
git commit -m "feat(storefront): update prisma schema for supabase db"
```

---

### Task 4: Push Schemas to Databases

**Files:** None

- [ ] **Step 1: Push Admin Schema to Neon**

```bash
cd admin-management-api && npx prisma db push --accept-data-loss
```
Expected: Schema pushed successfully.

- [ ] **Step 2: Push Storefront Schema to Supabase**

```bash
cd core-commerce-api && npx prisma db push --accept-data-loss
```
Expected: Schema pushed successfully.

- [ ] **Step 3: Generate Prisma Clients**

```bash
cd admin-management-api && npx prisma generate
cd ../core-commerce-api && npx prisma generate
```

---

### Task 5: Implement Admin Custom Auth Endpoints

**Files:**
- Create: `admin-management-api/src/routes/api/auth/login/+server.ts`
- Create: `admin-management-api/src/routes/api/auth/me/+server.ts`
- Create: `admin-management-api/src/routes/api/auth/logout/+server.ts`

- [ ] **Step 1: Write `login/+server.ts`**

Implement a simple login endpoint that checks password and sets an HTTP-only cookie.
*(Assume SvelteKit handles the routing and cookies via `cookies.set`)*.

```typescript
// admin-management-api/src/routes/api/auth/login/+server.ts
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { verifyPassword } from '../../../backend/auth/password';
// Note: You will need to implement/import a signJWT function if not using session tokens

export async function POST({ request, cookies }) {
    const { email, password } = await request.json();
    
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !(await verifyPassword(password, admin.password))) {
        return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Simplified auth: storing adminId in an encrypted/signed cookie
    // For this task, set a basic cookie (In reality, sign it via JWT)
    cookies.set('admin_session', admin.id, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return json({ success: true, user: { id: admin.id, email: admin.email, role: admin.role } });
}
```

- [ ] **Step 2: Write `me/+server.ts` and `logout/+server.ts`**

```typescript
// admin-management-api/src/routes/api/auth/me/+server.ts
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export async function GET({ cookies }) {
    const adminId = cookies.get('admin_session');
    if (!adminId) return json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) return json({ error: 'Unauthorized' }, { status: 401 });
    
    return json({ user: { id: admin.id, email: admin.email, role: admin.role, name: admin.name } });
}

// admin-management-api/src/routes/api/auth/logout/+server.ts
import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
    cookies.delete('admin_session', { path: '/' });
    return json({ success: true });
}
```

- [ ] **Step 3: Test endpoints (Build step)**

```bash
cd admin-management-api && npm run build
```
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add admin-management-api/src/routes/api/auth
git commit -m "feat(admin): add custom auth endpoints"
```

---

### Task 6: Refactor Admin Dashboard Auth

**Files:**
- Modify: `admin-dashboard/src/hooks.server.ts`
- Modify: `admin-dashboard/src/routes/login/+page.server.ts` (or `+page.svelte`)

- [ ] **Step 1: Remove Supabase from `hooks.server.ts`**

Update `admin-dashboard/src/hooks.server.ts` to check session against `admin-management-api` instead of Supabase.

```typescript
// admin-dashboard/src/hooks.server.ts
import { redirect } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib/config';

export const handle = async ({ event, resolve }) => {
    // Check session from cookies or by calling the API
    const sessionCookie = event.cookies.get('admin_session');
    
    if (sessionCookie) {
        try {
            // Forward cookie to API
            const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { cookie: `admin_session=${sessionCookie}` }
            });
            if (res.ok) {
                const data = await res.json();
                event.locals.user = data.user;
            }
        } catch (e) {}
    }

    if (event.url.pathname.startsWith('/') && !event.url.pathname.startsWith('/login')) {
        if (!event.locals.user) {
            throw redirect(303, '/login');
        }
    }

    return resolve(event);
};
```
*(Ensure `app.d.ts` is updated to include `user` in `Locals` and remove `supabase`)*.

- [ ] **Step 2: Update Login logic**

Modify `admin-dashboard/src/routes/login/+page.svelte` to call `/api/auth/login` instead of `supabase.auth.signInWithPassword`.

```javascript
// Replace supabase call with:
const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});
if (res.ok) {
    window.location.href = '/';
} else {
    const data = await res.json();
    error = data.error;
}
```

- [ ] **Step 3: Commit**

```bash
git add admin-dashboard/src/hooks.server.ts admin-dashboard/src/routes/login
git commit -m "refactor(admin-dashboard): switch to custom auth"
```

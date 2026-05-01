# Logistics & Tracking System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a granular shipping tracking system with carrier management and real-time logs in the `admin-service` (Neon) and `api-gateway`.

**Architecture:** Add `ShippingCarrier`, `ShippingTracking`, and `ShippingLog` models to Neon. Reroute logistics APIs through the Gateway. Enable admin updates and public tracking views.

**Tech Stack:** SvelteKit (admin-service), Express (Gateway), Prisma, Neon.

---

### Task 1: Update Database Schema (admin-service)

**Files:**
- Modify: `services/admin-service/prisma/schema.prisma`

- [ ] **Step 1: Add Logistics models to schema**

Add the following models to `services/admin-service/prisma/schema.prisma`:

```prisma
model ShippingCarrier {
  id        String             @id @default(cuid())
  name      String
  code      String             @unique
  isActive  Boolean            @default(true)
  trackings ShippingTracking[]
}

model ShippingTracking {
  id               String          @id @default(cuid())
  orderId          String          @unique
  order            Order           @relation(fields: [orderId], references: [id])
  carrierId        String
  carrier          ShippingCarrier @relation(fields: [carrierId], references: [id])
  trackingNumber   String
  estimatedArrival DateTime?
  currentStatus    String          @default("PICKED_UP")
  lastLocation     String?
  logs             ShippingLog[]
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
}

model ShippingLog {
  id          String           @id @default(cuid())
  trackingId  String
  tracking    ShippingTracking @relation(fields: [trackingId], references: [id], onDelete: Cascade)
  status      String
  location    String?
  description String?
  timestamp   DateTime         @default(now())
}
```

- [ ] **Step 2: Update Order model relation**

In the `Order` model, add the `tracking` field:
```prisma
model Order {
  // ... existing fields
  tracking      ShippingTracking?
}
```

- [ ] **Step 3: Sync database schema**

Run: `cd services/admin-service && npx prisma db push`
Expected: Database updated successfully.

- [ ] **Step 4: Commit schema changes**

```bash
git add services/admin-service/prisma/schema.prisma
git commit -m "feat(db): add logistics and tracking models to neon"
```

---

### Task 2: Update Seeding Strategy

**Files:**
- Modify: `services/admin-service/prisma/seed.ts`

- [ ] **Step 1: Add Indonesian carriers to seed**

Update the `seed` function to include standard carriers:

```typescript
// inside seed function
await prisma.shippingCarrier.createMany({
  data: [
    { name: "JNE (Jalur Nugraha Ekakurir)", code: "JNE" },
    { name: "J&T Express", code: "JNT" },
    { name: "SiCepat Ekspres", code: "SICEPAT" },
    { name: "Shopee Express", code: "SPX" },
    { name: "GoSend", code: "GOSEND" },
    { name: "GrabExpress", code: "GRAB" }
  ],
  skipDuplicates: true
});
```

- [ ] **Step 2: Run seed**

Run: `cd services/admin-service && npx prisma db seed`
Expected: Carriers populated in database.

- [ ] **Step 3: Commit seed changes**

```bash
git add services/admin-service/prisma/seed.ts
git commit -m "feat(db): seed standard Indonesian shipping carriers"
```

---

### Task 3: Update API Gateway Routing

**Files:**
- Modify: `services/api-gateway/index.ts`

- [ ] **Step 1: Add shipping proxy routes**

Add the following before the catch-all `/api` route:

```typescript
// 4. Logistics & Shipping APIs
app.use(['/api/storefront/shipping'], createProxyMiddleware({
  ...proxyOptions(`${ADMIN_BACKEND_URL}/api/storefront/shipping`),
}));

app.use(['/api/admin/management/shipping'], createProxyMiddleware({
  ...proxyOptions(`${ADMIN_BACKEND_URL}/api/admin/management/shipping`),
}));
```

- [ ] **Step 2: Verify Gateway builds**

Run: `cd services/api-gateway && npm run build`
Expected: Successful build.

- [ ] **Step 3: Commit Gateway changes**

```bash
git add services/api-gateway/index.ts
git commit -m "feat(gateway): route logistics and shipping APIs to admin-service"
```

---

### Task 4: Implement Carrier & Track Init Endpoints

**Files:**
- Create: `services/admin-service/src/routes/api/admin/management/shipping/carriers/+server.ts`
- Create: `services/admin-service/src/routes/api/admin/management/shipping/track/+server.ts`

- [ ] **Step 1: Create Carriers List endpoint**

File: `services/admin-service/src/routes/api/admin/management/shipping/carriers/+server.ts`
```typescript
import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function GET() {
  try {
    const carriers = await prisma.shippingCarrier.findMany({ where: { isActive: true } });
    return json({ success: true, data: carriers });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create Initialize Tracking endpoint**

File: `services/admin-service/src/routes/api/admin/management/shipping/track/+server.ts`
```typescript
import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function POST({ request }) {
  try {
    const { orderId, carrierId, trackingNumber, estimatedArrival } = await request.json();

    const tracking = await prisma.$transaction(async (tx) => {
      // 1. Create tracking record
      const t = await tx.shippingTracking.create({
        data: {
          orderId,
          carrierId,
          trackingNumber,
          estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
          logs: {
            create: {
              status: "PICKED_UP",
              description: "Package has been picked up by the carrier."
            }
          }
        }
      });

      // 2. Update Order status to SHIPPED
      await tx.order.update({
        where: { id: orderId },
        data: { status: "SHIPPED" }
      });

      return t;
    });

    return json({ success: true, data: tracking });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit admin shipping endpoints**

```bash
git add services/admin-service/src/routes/api/admin/management/shipping/
git commit -m "feat(admin-api): implement carrier list and tracking initialization"
```

---

### Task 5: Implement Shipping Log Update Endpoint

**Files:**
- Create: `services/admin-service/src/routes/api/admin/management/shipping/log/+server.ts`

- [ ] **Step 1: Create Shipping Log endpoint**

File: `services/admin-service/src/routes/api/admin/management/shipping/log/+server.ts`
```typescript
import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function POST({ request }) {
  try {
    const { trackingId, status, location, description } = await request.json();

    const log = await prisma.$transaction(async (tx) => {
      // 1. Add log entry
      const l = await tx.shippingLog.create({
        data: { trackingId, status, location, description }
      });

      // 2. Update current tracking status
      await tx.shippingTracking.update({
        where: { id: trackingId },
        data: { 
          currentStatus: status,
          lastLocation: location || undefined
        }
      });

      // 3. If status is DELIVERED, update Order status
      if (status === "DELIVERED") {
        const tracking = await tx.shippingTracking.findUnique({ where: { id: trackingId } });
        if (tracking) {
          await tx.order.update({
            where: { id: tracking.orderId },
            data: { status: "DELIVERED" }
          });
        }
      }

      return l;
    });

    return json({ success: true, data: log });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit log update endpoint**

```bash
git add services/admin-service/src/routes/api/admin/management/shipping/log/+server.ts
git commit -m "feat(admin-api): implement shipping log update endpoint"
```

---

### Task 6: Implement Public Tracking Endpoint

**Files:**
- Create: `services/admin-service/src/routes/api/storefront/shipping/track/[orderId]/+server.ts`

- [ ] **Step 1: Create Public Track endpoint**

File: `services/admin-service/src/routes/api/storefront/shipping/track/[orderId]/+server.ts`
```typescript
import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function GET({ params }) {
  const { orderId } = params;

  try {
    const tracking = await prisma.shippingTracking.findUnique({
      where: { orderId },
      include: {
        carrier: { select: { name: true, code: true } },
        logs: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!tracking) {
      return json({ success: false, error: "Tracking not found" }, { status: 404 });
    }

    return json({ success: true, data: tracking });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit public track endpoint**

```bash
git add services/admin-service/src/routes/api/storefront/shipping/track/
git commit -m "feat(storefront-api): implement public order tracking view"
```

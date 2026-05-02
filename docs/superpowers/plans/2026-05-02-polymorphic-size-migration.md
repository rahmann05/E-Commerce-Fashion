# Polymorphic Size Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dynamic size system that adapts to product categories (Letter sizes for shirts, numeric for pants, "One Size" for accessories) and ensure mandatory selection in the UI.

**Architecture:** Update the seeding logic to create category-aware variants. Modify the frontend modal to dynamically render these variants and enforce a deliberate user choice. Synchronize the backend cart logic to validate variant-specific stock.

**Tech Stack:** Prisma, Express.js, TypeScript, React (Next.js).

---

### Task 1: Category-Aware Seeding Logic

**Files:**
- Modify: `services/commerce-service/prisma/seed.ts`

- [ ] **Step 1: Update Variant Creation Loop**
Refactor the loop to detect category and generate the correct size array.
```typescript
  for (const p of products) {
    let sizes = ["S", "M", "L", "XL"]; // Default
    
    if (p.categoryId === createdCategories.jeans.id) {
      sizes = ["28", "30", "32", "34", "36"];
    } else if (p.categoryId === createdCategories.accessories.id) {
      sizes = ["One Size"];
    }

    const stockPerSize = Math.floor(p.stock / sizes.length);

    await prisma.product.create({
      data: {
        ...p,
        sizeOptions: sizes,
        sizeStocks: sizes.map(() => stockPerSize),
        variants: {
          create: sizes.map((size) => ({
            sku: `${p.slug.toUpperCase()}-${size.replace(' ', '-')}`,
            name: `${p.name} - ${size}`,
            size: size,
            stock: stockPerSize,
            price: p.price,
          })),
        },
      },
    });
  }
```

- [ ] **Step 2: Run Seed Script**
Run: `npx tsx prisma/seed.ts` (inside `services/commerce-service`)

- [ ] **Step 3: Commit**
`git add services/commerce-service/prisma/seed.ts`
`git commit -m "feat(commerce): polymorphic size seeding logic"`

---

### Task 2: Dynamic UI Adaptation

**Files:**
- Modify: `apps/storefront-web/src/frontend/components/catalogue/ProductDetailModal.tsx`

- [ ] **Step 1: Ensure mandatory interaction**
Verify that `selectedSize` is `null` by default and the button label logic is robust.
Ensure that for "One Size" items, the user still sees and must click the "One Size" button.

- [ ] **Step 2: Update stock display logic**
Ensure the label "Stock tersedia: X" updates immediately when a size button is clicked.

- [ ] **Step 3: Commit**
`git add apps/storefront-web/src/frontend/components/catalogue/ProductDetailModal.tsx`
`git commit -m "feat(storefront): category-aware size selection UI"`

---

### Task 4: Backend Cart Validation

**Files:**
- Modify: `services/customer-service/src/routes/cart.ts`

- [ ] **Step 1: Add Variant Stock Verification**
In the `POST /` route, before creating or updating a `cartItem`, add a check to the `commerce-service` or a direct Prisma check if possible (though preferred via service call to maintain boundaries).
Actually, since we use two DBs, `customer-service` should fetch the product again or a specific variant-check endpoint.

- [ ] **Step 2: Commit**
`git commit -m "feat(customer-service): validate variant-specific stock"`

---

### Task 5: Final Verification

- [ ] **Step 1: Rebuild and Restart**
Run: `docker-compose up -d --build`

- [ ] **Step 2: End-to-End Test**
- Verify Jeans show numbers.
- Verify Shirts show S-XL.
- Verify Accessories show "One Size".
- Verify "Add to Cart" requires a click.

- [ ] **Step 3: Commit**
`git commit -m "chore: finalize polymorphic size migration"`

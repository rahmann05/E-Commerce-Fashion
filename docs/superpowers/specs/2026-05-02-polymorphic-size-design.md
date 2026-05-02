# Polymorphic Size Management & Seeding Design

## 1. Overview
Currently, the system forces a single size standard (S-XL) on all products. This is incorrect for categories like Pants (which use numeric sizes) and Accessories (which are typically "One Size"). 

This design introduces a **Polymorphic Size System** where the size options and inventory tracking adapt dynamically based on the product category. Users will be required to confirm their size choice (including "One Size") before adding to the cart to ensure deliberate interaction and data integrity.

## 2. Dynamic Size Standards
Products will be seeded and rendered according to the following rules:

| Category | Size Standard | Example Values |
| :--- | :--- | :--- |
| **Tees / Outerwear** | Letter Sizes | `S, M, L, XL` |
| **Jeans** | Numeric Sizes | `28, 30, 32, 34, 36` |
| **Accessories** | Single Label | `One Size` |

## 3. Database & Seeding Strategy
- **Seeding (`seed.ts`)**: 
  - Detect category slug.
  - For `jeans`: Create variants for `["28", "30", "32", "34", "36"]`.
  - For `tees` / `outerwear`: Create variants for `["S", "M", "L", "XL"]`.
  - For `accessories`: Create a single variant for `["One Size"]`.
  - Distribute total product stock equally across created variants.
  - Update `sizeOptions` and `sizeStocks` arrays on the `Product` model to match.

## 4. UI Implementation (`ProductDetailModal.tsx`)
- **Interaction Flow**:
  - `selectedSize` initializes as `null`.
  - "Add to Cart" button is disabled and displays "Pilih Ukuran" until a selection is made.
  - For **Accessories**, the button "One Size" must be clicked explicitly by the user (Option 2 choice).
  - Stock labels update dynamically based on the selected size variant.
  - If a size is out of stock, the button is disabled and visually dimmed.

## 5. Backend Logic (`customer-service`)
- **Cart API (`cart.ts`)**:
  - Validates that the requested `productVariantId` exists and belongs to the correct `productId`.
  - Ensures stock is available for the *specific variant* before adding to the database.

## 6. Migration & Cleanup
- **Schema**: No schema changes required as the existing `ProductVariant` model already supports a `size` string.
- **Data Cleanup**: The `seed.ts` script will perform a `deleteMany()` on all products and variants to clear out the previous monolithic S-XL data.

## 7. Success Criteria
1. Opening a pair of Jeans shows numeric size options.
2. Opening a Watch shows only a "One Size" button.
3. Adding an item to the cart fails if no size is selected.
4. Total stock in the Cart/Checkout matches the sum of the specific size variant stocks.

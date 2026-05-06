# Storefront Web Agent Guidelines

This document serves as the foundational mandate for all AI agents working on the `storefront-web` application.

## 1. Architectural Philosophy: Headless First
The storefront is a **purely decoupled "Head"**. 
- **Zero Direct DB Access**: Never import Prisma or any database client. All data must come from the API Gateway.
- **Stateless Backend Communication**: Rely on the API Gateway for business logic.
- **Secure Auth**: Never use `localStorage` for JWT. Use `httpOnly` cookies managed by the API Gateway.

## 2. Directory Structure
Maintain the following standardized structure within `src/`:

- **`app/`**: Next.js App Router (Routing, Layouts, Metadata).
- **`features/`**: Domain-driven modules (`auth`, `catalogue`, `checkout`). Contains business logic and complex domain components.
- **`components/`**: UI building blocks.
    - **`atoms/`**: Primitive elements.
    - **`animations/`**: Specialized motion/visual components (waves, sliders).
    - **`layout/`**: Global UI structures (Navbar, Footer).
    - **`sections/`**: Reusable page blocks.
    - **`data/`**: Static configuration data.
- **`styles/`**: ALL CSS and CSS Modules. No `.css` files allowed in `components/` or `features/`.
- **`context/`**: Global React Context providers.
- **`lib/`**:
    - **`api/`**: Pure API clients (`auth.ts`, `cart.ts`, `catalogue.ts`, `account.ts`, `orders.ts`). **This is the only place fetch calls should live.**
    - **`actions/`**: Next.js Server Actions. Must delegate to `lib/api`.

## 3. Styling & Imports
- **Styles**: Centralized in `src/styles/`. Use descriptive names.
- **Aliases**: Always use absolute paths via `@/` alias.
- **Credentials**: Ensure all API calls use `credentials: "include"`.

## 4. Import Order
1. Built-ins (React/Next)
2. Libs (Lucide, Framer, etc)
3. API Clients (`@/lib/api`)
4. Features (`@/features`)
5. Components (`@/components`)
6. Styles (`@/styles`)

---
*Failure to follow these rules constitutes an architectural violation.*

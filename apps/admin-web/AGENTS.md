# Admin Web Agent Guidelines

This document serves as the foundational mandate for all AI agents working on the `admin-web` application.

## 1. Architectural Philosophy: Headless First
The admin dashboard is a **purely decoupled "Head"**. 
- **Zero Direct DB Access**: Never import Prisma or any database client in the frontend. All data must come from the API Gateway.
- **Stateless Backend Communication**: Rely on the API Gateway for business logic.
- **Secure Auth**: Authentication is managed via sessions/cookies.

## 2. Directory Structure (SvelteKit)
Maintain the following standardized structure within `src/`:

- **`routes/`**: File-based Routing.
    - **`(dashboard)/`**: Protected dashboard routes. Uses `(dashboard)/+layout.svelte`.
    - **`(auth)/`**: Login and Logout routes.
- **`features/`**: Domain-driven modules (`analytics`, `products`, `order`). Contains logic and domain components.
- **`components/`**: UI building blocks.
    - **`atoms/`**: Primitive, generic UI elements.
    - **`molecules/`**: Compound UI elements.
    - **`organisms/`**: Complex UI structures.
- **`styles/`**: Centralized CSS files (`globals.css`, `admin.css`). No `.css` files in other folders.
- **`lib/`**:
    - **`api/`**: Modular API clients (`products.ts`, `orders.ts`, `analytics.ts`). All `fetch` logic must live here.
    - **`auth/`**: Session/Cookie management helper.
    - **`utils/`**: Helper functions.
- **`types/`**: Shared TypeScript definitions.

## 3. Styling & Imports
- **Centralization**: All style files must be in `src/styles/`.
- **Aliases**: Use `@components`, `@features`, `@styles`, `@lib`, and `@/`.
- **Standard**: Always update `+page.server.ts` to use the modularized clients in `lib/api`.

---
*Failure to follow these rules constitutes an architectural violation.*

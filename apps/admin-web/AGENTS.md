# Admin Web Agent Guidelines (SvelteKit 2)

This document serves as the foundational mandate for all AI agents working on the `admin-web` application.

## 1. Architectural Philosophy: Headless First
The admin dashboard is a **purely decoupled "Head"**. 
- **Zero Direct DB Access**: Never import Prisma or any database client.
- **Stateless Backend Communication**: Rely on the API Gateway or internal mesh URLs in `+page.server.ts`.
- **Secure Auth**: Authentication is managed via sessions/cookies.

## 2. Directory Structure (SvelteKit 2)
Maintain the following standardized structure within `src/`:

- **`routes/`**: File-based Routing.
    - **Route Groups**: Use `(dashboard)` and `(auth)` groups to isolate layouts.
    - **Server Loaders**: Use `+page.server.ts` to fetch data via `lib/api`.
- **`features/`**: Domain-driven modules (`analytics`, `products`, `order`).
- **`components/`**: Atomic Design (`atoms`, `molecules`, `organisms`).
- **`styles/`**: Centralized CSS files in `src/styles/`.
- **`lib/`**:
    - **`api/`**: Modular API clients. All `fetch` logic must live here.
    - **`auth/`**: Cookie management. Note: SvelteKit 2 requires `path: '/'` in `cookies.set/delete`.

## 3. Styling & Imports
- **Aliases**: Use `@components`, `@features`, `@styles`, `@lib`, and `@/`.
- **Layouts**: Keep `+layout.svelte` files thin. Delegate UI logic to components.

## 4. Import Conventions
- Preferred order:
    1. Svelte/SvelteKit imports
    2. API Clients (`$lib/api` or `@lib/api`)
    3. Components (`@components/...`)
    4. Features (`@features/...`)
    5. Styles (`@styles/...`)

---
*Failure to follow these rules constitutes an architectural violation.*

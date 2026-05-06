# Storefront Web Agent Guidelines (Next.js 15)

This document serves as the foundational mandate for all AI agents working on the `storefront-web` application.

## 1. Architectural Philosophy: Headless First
The storefront is a **purely decoupled "Head"**. 
- **Zero Direct DB Access**: Never import Prisma or any database client. All data must come from the API Gateway.
- **Stateless Backend Communication**: Rely on the API Gateway for business logic.
- **Secure Auth**: Never use `localStorage` for JWT. Use `httpOnly` cookies managed by the API Gateway.

## 2. Directory Structure
Maintain the following standardized structure within `src/`:

- **`app/`**: Next.js App Router.
    - **Data Fetching**: Use `async` Server Components with `fetch`.
    - **Caching**: Note that Next.js 15 defaults to `no-store` for many operations. Use `cache: 'force-cache'` only for static data.
    - **Error Handling**: Use `error.tsx` and `not-found.tsx` for graceful degradation.
- **`features/`**: Domain-driven modules (`auth`, `catalogue`, `checkout`).
- **`components/`**: UI building blocks (atoms, animations, layout, sections).
- **`styles/`**: ALL CSS and CSS Modules.
- **`context/`**: Global React Context providers.
- **`lib/`**:
    - **`api/`**: Pure API clients. **Only place for fetch calls.**
    - **`actions/`**: Next.js Server Actions. Must delegate to `lib/api`.

## 3. Implementation Mandates (Next.js 15)
- **Server Actions**: All Server Actions must be in `src/lib/actions/`. They default to `no-store`.
- **Fetch**: Always use `credentials: "include"` in `lib/api` to support cookie-based sessions.
- **Relative Imports**: Avoid deep relative imports. Always use the `@/` alias.

## 4. Import Order
1. React/Next.js built-ins
2. Third-party libraries
3. API Clients (`@/lib/api`)
4. Features (`@/features`)
5. Components (`@/components`)
6. Styles (`@/styles`)

---
*Failure to follow these rules constitutes an architectural violation.*

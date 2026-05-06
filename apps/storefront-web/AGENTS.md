# Storefront Web Agent Guidelines

This document serves as the foundational mandate for all AI agents working on the `storefront-web` application. You must strictly adhere to these architectural patterns and directory structures.

## 1. Architectural Philosophy: Headless First
The storefront is a **purely decoupled "Head"**. 
- **Zero Direct DB Access**: Never import Prisma or any database client. All data must come from the API Gateway.
- **Stateless Backend Communication**: Rely on the API Gateway for business logic.
- **Secure Auth**: Never use `localStorage` for JWT. Use `httpOnly` cookies managed by the API Gateway.

## 2. Directory Structure
Maintain the following standardized structure within `src/`:

- **`app/`**: Next.js App Router. Contains ONLY routing logic, layouts, and route-specific metadata. Minimize UI logic here.
- **`features/`**: Domain-driven modules (e.g., `catalogue`, `auth`, `checkout`). Contains business logic, specific components, and state related to that domain.
- **`components/`**: UI building blocks.
    - **`atoms/`**: Primitive, generic UI elements.
    - **`animations/`**: Specialized visual/motion components (e.g., waves, sliders).
    - **`layout/`**: Global UI structures like Navbar and Footer.
    - **`sections/`**: Reusable page sections.
- **`styles/`**: ALL CSS and CSS Modules must reside here. No `.css` files allowed inside `components/` or `features/`.
- **`context/`**: Global React Context providers.
- **`lib/`**: Shared utilities, API clients, and constants.

## 3. Styling Mandates
- **Centralization**: All style files must be in `src/styles/`.
- **Naming**: Use descriptive names for CSS modules (e.g., `CatalogueWaveSection.module.css` instead of `style.module.css`).
- **Imports**: Always use absolute paths via the `@/` alias (e.g., `import styles from "@/styles/Navbar.module.css"`).

## 4. Import Conventions
- Use the `@/` alias for all internal imports.
- Preferred order:
    1. React/Next.js built-ins
    2. Third-party libraries
    3. Context/Hooks (`@/context`, `@/hooks`)
    4. Features (`@/features`)
    5. Components (`@/components`)
    6. Styles (`@/styles`)

## 5. Security & Auth
- **No LocalStorage**: Do not read from or write to `localStorage` for authentication tokens.
- **Credentials**: Ensure all `fetch` calls use `credentials: "include"` to support cookie-based sessions.
- **Gateway Proxying**: External API calls (e.g., geography, analytics) must be proxied through the API Gateway to maintain a single point of failure and audit log.

## 6. Development Workflow
- **Verification**: Run `npm run lint` and `npm run build` locally before claiming a task is complete.
- **Cleanliness**: Delete empty directories and unused files immediately.
- **Atomic Commits**: Group changes by logical phase (e.g., "refactor(styles)", "feat(catalogue)").

---
*Failure to follow these rules constitutes an architectural violation.*

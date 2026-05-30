# Update AGENTS.md Documentation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create highly comprehensive `AGENTS.md` files for `storefront-web`, `admin-web`, and `api-gateway` that strictly follow a two-section structure: "1. Instruksi dan Panduan" and "2. Kondisi Saat Ini".
**Architecture:** Markdown documentation reflecting Next.js 15, SvelteKit 2, and Express 5 BFF patterns in a Headless architecture.
**Tech Stack:** Markdown

---

### Task 1: Update Storefront Web AGENTS.md

**Files:**
- Modify: `apps/storefront-web/AGENTS.md`

- [ ] **Step 1: Rewrite Storefront AGENTS.md**
Rewrite the file to contain exactly two main sections.
Section 1 (Instruksi dan Panduan) must cover:
- Next.js 15 App Router guidelines (async Server Components, caching `no-store`, `error.tsx`).
- Headless philosophy (Zero DB access, all via Gateway `lib/api`).
- Styling rules (centralized in `src/styles`, atomic design).
- Absolute imports (`@/`).

Section 2 (Kondisi Saat Ini) must document the current actual state:
- Folder structure (`app/`, `features/catalogue`, `components/animations`, `components/atoms`, `lib/api`).
- `lib/api/` contains `auth.ts`, `cart.ts`, `catalogue.ts`, `account.ts`, `orders.ts`, `shipping.ts`.
- Uses `httpOnly` cookies via gateway, no local storage.

```bash
git add apps/storefront-web/AGENTS.md
git commit -m "docs(storefront): restructure AGENTS.md into 2 sections"
```

### Task 2: Update Admin Web AGENTS.md

**Files:**
- Modify: `apps/admin-web/AGENTS.md`

- [ ] **Step 1: Rewrite Admin AGENTS.md**
Rewrite the file to contain exactly two main sections.
Section 1 (Instruksi dan Panduan) must cover:
- SvelteKit 2 guidelines (Route groups, `+page.server.ts` loaders).
- Headless philosophy (Zero DB access, all data via `lib/api`).
- Component hierarchy (Atoms, molecules, organisms).
- Aliases (`@components`, `@features`, `@styles`, `@lib`).

Section 2 (Kondisi Saat Ini) must document the current actual state:
- Route groups `(dashboard)` and `(auth)`.
- Features use the name `products` (not catalogue), `order`, `analytics`.
- `lib/api/` contains modular API clients (`products.ts`, `orders.ts`, `analytics.ts`, `dashboard.ts`).
- Styles centralized in `src/styles/` (`globals.css`, `admin.css`).

```bash
git add apps/admin-web/AGENTS.md
git commit -m "docs(admin): restructure AGENTS.md into 2 sections"
```

### Task 3: Update API Gateway AGENTS.md

**Files:**
- Modify: `services/api-gateway/AGENTS.md`

- [ ] **Step 1: Rewrite Gateway AGENTS.md**
Rewrite the file to contain exactly two main sections.
Section 1 (Instruksi dan Panduan) must cover:
- Express BFF (Backend for Frontend) pattern.
- Strict proxying rules using `http-proxy-middleware`.
- Security validation using Joi (from `@novarium/contracts`) and JWT.
- Internal Mesh communication (using `x-internal-key`).

Section 2 (Kondisi Saat Ini) must document the current actual state:
- Modular routes separated into `src/routes/storefront/` and `src/routes/admin/`.
- Domain-specific proxies in `src/proxies/` (`commerce.proxy.ts`, `admin.proxy.ts`).
- `config/env.ts` handles all environment variables.
- Gateway effectively rewrites paths (e.g. `/api/admin/auth` -> `/api/admin/management/auth`) seamlessly.

```bash
git add services/api-gateway/AGENTS.md
git commit -m "docs(gateway): restructure AGENTS.md into 2 sections"
```
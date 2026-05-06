# API Gateway Agent Guidelines (Express BFF)

This document serves as the foundational mandate for all AI agents working on the `api-gateway` service.

## 1. Architectural Philosophy: BFF Pattern
The Gateway acts as the **Backend for Frontend (BFF)** and a centralized entry point.
- **Decoupling**: The gateway masks backend service complexity from the frontends.
- **Security**: Centralizes JWT verification and internal mesh key validation.
- **Validation**: Enforces strict `Joi` validation on all incoming payloads before proxying.

## 2. Directory Structure
Maintain the following standardized structure:

- **`config/`**: Environment and global routing config (`env.ts`).
- **`src/`**:
    - **`app.ts`**: Core Express application setup.
    - **`routes/`**: Modular route definitions.
        - **`storefront/`**: BFF routes for the consumer application.
        - **`admin/`**: BFF routes for the management application.
    - **`middlewares/`**: Shared logic (`auth.ts`, `validate.ts`, `cors.ts`).
    - **`proxies/`**: Domain-specific proxy configurations using `http-proxy-middleware`.

## 3. Development Mandates
- **Modular Routing**: Use `express.Router()` with `mergeParams: true` for nested structures.
- **Proxy Configuration**: Always use the `proxyOptions` factory in `proxies/common.proxy.ts`.
- **Internal Traffic**: Allow internal service traffic (mesh) if `x-internal-key` matches `INTERNAL_SERVICE_KEY`.
- **Schema Validation**: Use Joi schemas from `@novure/contracts` whenever possible.

## 4. Security
- **JWT**: Verify `novure_jwt` cookie or Bearer token in the `authenticateJWT` middleware.
- **Headers**: Forward `x-user-id` and `x-user-role` to downstream services after verification.
- **CORS**: Strictly adhere to `env.ALLOWED_ORIGINS`.

---
*Failure to follow these rules constitutes an architectural violation.*

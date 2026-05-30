# Design Spec - Environment Synchronization

**Date:** 2026-05-08  
**Topic:** Synchronizing local `.env` files with the root `.env` SSOT.

## 1. Overview
The goal is to ensure all web applications and services in the e-commerce monorepo use consistent environment variable values as defined in the root `.env` file. Discrepancies (like Midtrans keys) will be resolved by prioritizing root values.

## 2. Source of Truth (SSOT)
The root `.env` file located at `G:\TUGAS KUONTOL\E-COMMERCE\.env`.

## 3. Variable Mapping

### apps/admin-web/.env
| Root Variable | Local Variable |
|---------------|----------------|
| `PUBLIC_GATEWAY_URL` | `PUBLIC_GATEWAY_URL` |
| `PUBLIC_SUPABASE_URL` | `PUBLIC_SUPABASE_URL` |
| `PUBLIC_SUPABASE_ANON_KEY` | `PUBLIC_SUPABASE_ANON_KEY` |

### apps/storefront-web/.env
| Root Variable | Local Variable |
|---------------|----------------|
| `NEXT_PUBLIC_API_URL` | `NEXT_PUBLIC_API_URL` |
| `PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

### services/admin-service/.env
| Root Variable | Local Variable |
|---------------|----------------|
| `ADMIN_DATABASE_URL` | `DATABASE_URL` |
| `ADMIN_DIRECT_URL` | `DIRECT_URL` |
| `PUBLIC_SUPABASE_URL` | `PUBLIC_SUPABASE_URL` |
| `PUBLIC_SUPABASE_ANON_KEY` | `PUBLIC_SUPABASE_ANON_KEY` |
| `MIDTRANS_SERVER_KEY` | `MIDTRANS_SERVER_KEY` |

### services/api-gateway/.env
| Root Variable | Local Variable |
|---------------|----------------|
| `GATEWAY_PORT` | `PORT` |
| `COMMERCE_SERVICE_URL` | `STOREFRONT_BACKEND_URL` |
| `ADMIN_SERVICE_URL` | `ADMIN_BACKEND_URL` |
| `PUBLIC_SUPABASE_URL` | `PUBLIC_SUPABASE_URL` |

### services/commerce-service/.env
| Root Variable | Local Variable |
|---------------|----------------|
| `CORE_DATABASE_URL` | `DATABASE_URL` |
| `CORE_DIRECT_URL` | `DIRECT_URL` |
| `MIDTRANS_IS_PRODUCTION` | `MIDTRANS_IS_PRODUCTION` |
| `MIDTRANS_SERVER_KEY` | `MIDTRANS_SERVER_KEY` |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` |
| `PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

## 4. Implementation Strategy
- Use surgical updates (e.g., `replace` or targeted `write_file`) to update existing values.
- Retain service-specific variables that do not have a counterpart in the root `.env`.
- Ensure all values match exactly with the root `.env` counterparts.

## 5. Verification
- Read all updated `.env` files and compare them with the root `.env` mappings.
- Confirm that services still start correctly (manual or automated check if possible).

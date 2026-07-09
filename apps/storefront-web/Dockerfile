# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/admin-web/package.json ./apps/admin-web/
COPY apps/storefront-web/package.json ./apps/storefront-web/
COPY services/commerce-service/package.json ./services/commerce-service/
COPY services/admin-service/package.json ./services/admin-service/
COPY services/customer-service/package.json ./services/customer-service/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/

RUN npm install --no-audit --no-fund

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_COMMERCE_API_URL
ARG NEXT_PUBLIC_CUSTOMER_API_URL
ARG NEXT_PUBLIC_ORDER_API_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_COMMERCE_API_URL=$NEXT_PUBLIC_COMMERCE_API_URL
ENV NEXT_PUBLIC_CUSTOMER_API_URL=$NEXT_PUBLIC_CUSTOMER_API_URL
ENV NEXT_PUBLIC_ORDER_API_URL=$NEXT_PUBLIC_ORDER_API_URL

RUN npm run build -w project

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/storefront-web/public ./apps/storefront-web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront-web/.next/static ./apps/storefront-web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "--max-old-space-size=256", "apps/storefront-web/server.js"]

# Stage 1: Dependencies
FROM node:24.15.0-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/admin-web/package.json ./apps/admin-web/
COPY apps/storefront-web/package.json ./apps/storefront-web/
COPY services/api-gateway/package.json ./services/api-gateway/
COPY services/commerce-service/package.json ./services/commerce-service/
COPY services/admin-service/package.json ./services/admin-service/
COPY services/customer-service/package.json ./services/customer-service/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/

RUN npm ci

# Stage 2: Builder
FROM node:24.15.0-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_GATEWAY_URL
ARG PUBLIC_STOREFRONT_URL

ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV PUBLIC_GATEWAY_URL=$PUBLIC_GATEWAY_URL
ENV PUBLIC_STOREFRONT_URL=$PUBLIC_STOREFRONT_URL

RUN npm run prepare -w ecommerce-admin || echo "Prepare failed, continuing..."
RUN npm run build -w ecommerce-admin

# Stage 3: Production Dependencies
FROM node:24.15.0-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/admin-web/package.json ./apps/admin-web/
COPY apps/storefront-web/package.json ./apps/storefront-web/
COPY services/api-gateway/package.json ./services/api-gateway/
COPY services/commerce-service/package.json ./services/commerce-service/
COPY services/admin-service/package.json ./services/admin-service/
COPY services/customer-service/package.json ./services/customer-service/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/

RUN npm ci --omit=dev --ignore-scripts

# Stage 4: Runner
FROM node:24.15.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

# Copy folder build and package.json
COPY --from=builder /app/apps/admin-web/build ./build
COPY --from=builder /app/apps/admin-web/package.json ./package.json
# Copy production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules

RUN chown -R sveltekit:nodejs /app

USER sveltekit
EXPOSE 4000
ENV PORT=4000
CMD ["node", "build"]

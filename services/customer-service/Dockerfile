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
COPY packages/shared/package.json ./packages/shared/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/

RUN npm install --no-audit --no-fund

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=services/customer-service/prisma/schema.prisma

# Build shared package first
RUN npm run build -w @novarium/shared

# Build the specific service
RUN npm run build -w @novarium/customer-service

# Stage 3: Production Dependencies
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/admin-web/package.json ./apps/admin-web/
COPY apps/storefront-web/package.json ./apps/storefront-web/
COPY services/commerce-service/package.json ./services/commerce-service/
COPY services/admin-service/package.json ./services/admin-service/
COPY services/customer-service/package.json ./services/customer-service/
COPY packages/shared/package.json ./packages/shared/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/

RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund

# Stage 4: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat openssl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 customerjs

# Copy folder dist and package.json
COPY --from=builder /app/services/customer-service/dist ./dist
COPY --from=builder /app/services/customer-service/package.json ./package.json
# Copy the built shared packages so monorepo symlinks in node_modules can resolve
COPY --from=builder /app/packages ./packages
# Copy production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules
# Copy the generated Prisma client from builder (not generated during prod-deps)
COPY --from=builder /app/services/customer-service/node_modules/@novarium/customer-prisma ./node_modules/@novarium/customer-prisma

USER customerjs

# Run with node (Memory limited for Railway Free Tier)
CMD ["node", "--max-old-space-size=256", "dist/index.js"]

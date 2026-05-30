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

# Generate Prisma Client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build the specific service
RUN npm run build -w @novarium/customer-service

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
RUN adduser --system --uid 1001 customerjs

# Copy folder dist and package.json
COPY --from=builder /app/services/customer-service/dist ./dist
COPY --from=builder /app/services/customer-service/package.json ./package.json
# Copy production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules
# Copy the generated Prisma client from builder (not generated during prod-deps)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER customerjs
EXPOSE 4002
ENV PORT=4002

# Run with node
CMD ["node", "dist/index.js"]

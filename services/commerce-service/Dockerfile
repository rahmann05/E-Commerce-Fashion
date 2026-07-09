# Stage 1: Dependencies (Install all dependencies for build)
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

# Stage 2: Builder (Compile TS to JS)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=services/commerce-service/prisma/schema.prisma

# Build shared package first
RUN npm run build -w @novarium/shared

# Build the specific service
RUN npm run build -w @novarium/commerce-service

# Stage 3: Production Dependencies (Install ONLY prod deps)
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

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy only the compiled output and necessary files
COPY --from=builder /app/services/commerce-service/dist ./dist
COPY --from=builder /app/services/commerce-service/package.json ./package.json
COPY --from=builder /app/services/commerce-service/prisma ./prisma
# Copy the built shared packages so monorepo symlinks in node_modules can resolve
COPY --from=builder /app/packages ./packages
# Copy production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules
# Copy the generated Prisma client from builder (not generated during prod-deps)
COPY --from=builder /app/services/commerce-service/node_modules/@novarium/commerce-prisma ./node_modules/@novarium/commerce-prisma

USER expressjs
EXPOSE 3001
ENV PORT=3001

# Run with node (Memory limited for Railway Free Tier)
CMD ["node", "--max-old-space-size=256", "dist/index.js"]

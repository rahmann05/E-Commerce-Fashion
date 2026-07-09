FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package*.json ./

# Copy packages and service
COPY packages ./packages
COPY services/order-service ./services/order-service

# Install all dependencies using workspaces
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm config set maxsockets 5 && npm install

# Generate Prisma Client specifically for order-service
WORKDIR /app/services/order-service
RUN npx prisma generate

# Build shared package and order-service
WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/services/order-service
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy built artifacts and dependencies
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/order-service/node_modules ./services/order-service/node_modules
COPY --from=builder /app/services/order-service/dist ./services/order-service/dist
COPY --from=builder /app/services/order-service/package.json ./services/order-service/package.json
COPY --from=builder /app/services/order-service/prisma ./services/order-service/prisma

WORKDIR /app/services/order-service

# Run with node (Memory limited for Railway Free Tier)
CMD ["node", "--max-old-space-size=256", "dist/index.js"]

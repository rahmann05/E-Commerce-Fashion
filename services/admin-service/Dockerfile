# Stage 1: Dependencies
FROM node:24.15.0-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:24.15.0-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ARGs for build time
ARG DATABASE_URL
ARG MIDTRANS_SERVER_KEY
ARG MIDTRANS_IS_PRODUCTION
ARG NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

# Set them as ENV for build process
ENV DATABASE_URL=$DATABASE_URL
ENV MIDTRANS_SERVER_KEY=$MIDTRANS_SERVER_KEY
ENV MIDTRANS_IS_PRODUCTION=$MIDTRANS_IS_PRODUCTION
ENV NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=$NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

RUN npx prisma generate
RUN npm run build

# Stage 3: Production Dependencies
FROM node:24.15.0-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

ARG DATABASE_URL
ARG DIRECT_URL
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL

RUN npm ci --omit=dev && npm cache clean --force
RUN npx prisma generate

# Stage 4: Runner
FROM node:24.15.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=prod-deps /app/node_modules ./node_modules

# Set permissions
RUN chown -R sveltekit:nodejs /app

USER sveltekit
EXPOSE 4001
ENV PORT=4001
CMD ["node", "build"]

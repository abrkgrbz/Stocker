# Multi-stage build for Next.js app - optimized for production
FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# Slim is debian based, so we don't need apk/libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
# Install all dependencies including devDependencies (needed for build)
RUN npm ci --legacy-peer-deps --include=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_DOMAIN
ARG NEXT_PUBLIC_AUTH_DOMAIN

# Build arguments for server-side environment variables (needed for env.ts validation)
ARG API_INTERNAL_URL
ARG HMAC_SECRET
ARG NODE_ENV

# Sentry build arguments (passed from docker-compose.yml)
ARG NEXT_PUBLIC_SENTRY_DSN
ARG SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_ENVIRONMENT
ARG SENTRY_AUTH_TOKEN

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
# Increase Node.js memory limit for build (prevents heap out of memory)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Set all required environment variables for build (env.ts validation)
ENV NODE_ENV=$NODE_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_DOMAIN=$NEXT_PUBLIC_BASE_DOMAIN
ENV NEXT_PUBLIC_AUTH_DOMAIN=$NEXT_PUBLIC_AUTH_DOMAIN
ENV API_INTERNAL_URL=$API_INTERNAL_URL
ENV HMAC_SECRET=$HMAC_SECRET

# Set Sentry env vars for build (NEXT_PUBLIC_* must be available at build time)
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

# Build Next.js app (with env vars validation)
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install wget for healthcheck (node:20-slim doesn't include it)
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the app
CMD ["node", "server.js"]

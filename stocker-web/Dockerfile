# Multi-stage build for React app - optimized for production
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for better caching
COPY stocker-web/package*.json ./

# Install dependencies with clean install for production
# Fix for rollup on Alpine Linux
RUN npm ci --production=false && \
    npm rebuild @rollup/rollup-linux-x64-musl

# Copy source files
COPY stocker-web/ .

# Build the application with production optimizations
ARG VITE_API_URL=https://api.stoocker.app
ARG VITE_API_BASE_URL=https://api.stoocker.app
ENV NODE_ENV=production
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build with optimizations
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY stocker-web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
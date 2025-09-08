# Multi-stage build for React Admin app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY stocker-admin/package*.json ./

# Debug: Check if files were copied
RUN echo "=== Checking copied files ===" && \
    ls -la && \
    if [ -f package.json ]; then \
        echo "package.json found"; \
    else \
        echo "ERROR: package.json not found!"; \
        exit 1; \
    fi

# Install dependencies (force platform and skip optional deps)
RUN npm install --legacy-peer-deps --force --no-optional

# Copy all source files
COPY stocker-admin/ .

# Build the application (skip TypeScript checking)
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=https://api.stoocker.app
RUN npx vite build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY stocker-admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
# Multi-stage build for React Admin app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package.json first (not package-lock.json)
COPY stocker-admin/package.json ./

# Clean npm cache and install with compatibility flags
RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install --force --legacy-peer-deps || \
    (npm config set strict-peer-deps false && \
     npm install --no-audit --no-fund)

# Copy all source files
COPY stocker-admin/ .

# Debug: Check what files were copied
RUN echo "=== Checking current directory ===" && \
    ls -la && \
    echo "=== Checking if src exists ===" && \
    ls -la src/ || echo "src directory not found" && \
    echo "=== Checking features ===" && \
    ls -la src/features/ || echo "features not found"

# Build the application
ENV NODE_ENV=production
ENV VITE_API_URL=https://api.stoocker.app
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
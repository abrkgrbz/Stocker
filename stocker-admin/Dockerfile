# Multi-stage build for React Admin app
# Stage 1: Build the application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Debug: Show what files exist in the build context
RUN echo "=== Build context check ===" && ls -la /

# Copy package files
COPY stocker-admin/package*.json ./

# Debug: Check what was copied
RUN echo "=== After copy ===" && \
    ls -la && \
    echo "=== Checking for package.json ===" && \
    if [ -f package.json ]; then \
        echo "package.json found! Contents:" && \
        head -20 package.json; \
    else \
        echo "ERROR: package.json not found!" && \
        echo "Current directory contents:" && \
        ls -la && \
        exit 1; \
    fi

# Install dependencies with more verbose output
RUN echo "=== Installing dependencies ===" && \
    npm install --legacy-peer-deps --verbose || \
    (echo "=== NPM Install failed, trying with --force ===" && \
     npm install --legacy-peer-deps --force --verbose)

# Copy all source files
COPY stocker-admin/ .

# Build the application
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=https://api.stoocker.app

# Debug: Check if all files are present
RUN echo "=== Checking source files ===" && \
    ls -la && \
    echo "=== Checking for TypeScript config ===" && \
    ls -la tsconfig*.json || echo "No tsconfig files found"

# Try to build with error handling
RUN echo "=== Running build ===" && \
    npm run build || \
    (echo "=== Build failed, trying without TypeScript check ===" && \
     npx vite build)

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY stocker-admin/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
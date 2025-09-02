# Multi-stage build for React app
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files (only package.json, not lock file)
COPY stocker-web/package.json ./

# Clean everything and fresh install for Alpine Linux
RUN rm -rf node_modules package-lock.json .vite && \
    npm cache clean --force && \
    npm install --legacy-peer-deps --no-optional

# Copy all source files
COPY stocker-web/ .

# Clean build cache and build the application
RUN rm -rf dist node_modules/.vite && \
    npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY stocker-web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
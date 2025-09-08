# Multi-stage build for React app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy only package.json first (not package-lock.json)
COPY stocker-web/package.json ./

# Clean install to regenerate lock file for Linux
RUN rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps

# Copy all source files
COPY stocker-web/ .

# Build the application
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=https://api.stoocker.app
RUN npx vite build

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
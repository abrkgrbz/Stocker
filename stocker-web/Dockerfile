# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install Python and build tools for native dependencies
RUN apk add --no-cache python3 make g++ 

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Clean npm cache and install
RUN npm cache clean --force && \
    npm config set registry https://registry.npmjs.org/ && \
    npm install --verbose || npm install --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html

# Remove default nginx static files
RUN rm -rf ./*

# Copy built application
COPY --from=build /app/dist .

# Create nginx config
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
      root /usr/share/nginx/html; \
      index index.html index.htm; \
      try_files $uri $uri/ /index.html; \
    } \
    location /api { \
      proxy_pass http://api:80; \
      proxy_http_version 1.1; \
      proxy_set_header Upgrade $http_upgrade; \
      proxy_set_header Connection "upgrade"; \
      proxy_set_header Host $host; \
      proxy_cache_bypass $http_upgrade; \
    } \
    location /hubs { \
      proxy_pass http://api:80; \
      proxy_http_version 1.1; \
      proxy_set_header Upgrade $http_upgrade; \
      proxy_set_header Connection "upgrade"; \
      proxy_set_header Host $host; \
      proxy_cache_bypass $http_upgrade; \
    } \
  }' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
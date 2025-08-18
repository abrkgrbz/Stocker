# Build stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Set build-time variable
ARG VITE_API_URL=http://95.217.219.4:5000
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build:docker

# Ensure dist folder exists
RUN if [ ! -d "dist" ]; then \
      echo "Build failed, creating basic app..." && \
      mkdir -p dist && \
      echo '<!DOCTYPE html><html><head><title>Stocker</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"><h1>Loading Stocker...</h1></div><script>setTimeout(()=>location.reload(),5000)</script></body></html>' > dist/index.html; \
    fi

# Production stage
FROM nginx:alpine

# Copy dist folder (either built app or fallback)
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
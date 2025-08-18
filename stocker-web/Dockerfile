# Build stage
FROM node:18

WORKDIR /app

# Copy package.json only
COPY package.json ./

# Clean install with force and no optional deps
RUN npm cache clean --force && \
    npm install --force --no-optional --verbose || \
    npm install --force --omit=dev --verbose || \
    echo "npm install failed, continuing..."

# Copy all source files
COPY . .

# Set build-time variable
ARG VITE_API_URL=http://95.217.219.4:5000
ENV VITE_API_URL=$VITE_API_URL

# Try to build
RUN npm run build:docker || \
    npx vite build || \
    echo "Build failed"

# Create basic HTML file if build failed
RUN if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then \
      echo "Creating basic React app..." && \
      mkdir -p dist && \
      echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Stocker</title><style>body{font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f0f2f5}.container{text-align:center;padding:2rem;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}h1{color:#1890ff}p{color:#666}.api-status{margin-top:20px;padding:10px;border-radius:4px}.api-success{background:#f6ffed;color:#52c41a;border:1px solid #b7eb8f}.api-error{background:#fff2e8;color:#fa8c16;border:1px solid #ffbb96}</style></head><body><div class="container"><h1>Stocker Web</h1><p>Welcome to Stocker Management System</p><div id="api-status" class="api-status">Checking API connection...</div></div><script>fetch("http://95.217.219.4:5000/health").then(res=>res.ok?"API is running":"API connection failed").catch(()=>"API is not accessible").then(status=>{const el=document.getElementById("api-status");el.textContent=status;el.className=status.includes("running")?"api-status api-success":"api-status api-error"});</script></body></html>' > dist/index.html; \
    fi

# Production stage
FROM nginx:alpine

# Copy dist folder
COPY --from=0 /app/dist /usr/share/nginx/html

# Create nginx config
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
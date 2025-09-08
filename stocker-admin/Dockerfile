# Single stage build for React Admin app
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files with optional pattern
COPY stocker-admin/package*.json ./

# Debug: Check if files are copied correctly
RUN ls -la && \
    echo "Checking for package.json..." && \
    if [ -f package.json ]; then \
        echo "package.json found!"; \
    else \
        echo "ERROR: package.json not found!"; \
        exit 1; \
    fi

# Install dependencies with verbose output
RUN npm install --verbose || (echo "npm install failed" && exit 1)

# Copy all source files
COPY stocker-admin/ .

# Build the application
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose port 3010 (different from web which uses 3000)
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3010 || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "3010"]
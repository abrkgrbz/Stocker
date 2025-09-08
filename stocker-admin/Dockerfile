# Single stage build for React Admin app
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY stocker-admin/package.json stocker-admin/package-lock.json ./

# Install dependencies
RUN npm install

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
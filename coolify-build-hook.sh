#!/bin/bash

# Coolify Build Hook Script
# This script runs automatically during Coolify deployment

echo "🚀 Starting Coolify build hook..."

# Ensure scripts are executable
chmod +x scripts/*.sh

# Create network if not exists
docker network create stocker-network 2>/dev/null || true

# Run setup script
if [ -f "scripts/setup-coolify-services.sh" ]; then
    echo "📦 Running setup script..."
    bash scripts/setup-coolify-services.sh
fi

# Initialize SSL configuration
if [ -f "scripts/init-ssl-coolify.sh" ]; then
    echo "🔒 Initializing SSL configuration..."
    bash scripts/init-ssl-coolify.sh
fi

echo "✅ Build hook completed!"
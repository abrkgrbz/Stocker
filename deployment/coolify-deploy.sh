#!/bin/bash

# Coolify Deployment Helper Script

set -e

echo "=================================="
echo "   Coolify Deployment Helper"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found in root directory"
    echo "Please run this script from the project root"
    exit 1
fi

# Test Docker builds locally
echo "Testing Docker builds..."

# Test API build
echo "Building API..."
docker build -f deployment/Dockerfile.api -t stocker-api-test . || {
    echo "API build failed, trying simple Dockerfile..."
    docker build -f deployment/Dockerfile.api.simple -t stocker-api-test .
}

echo "✓ API build successful"

# Test database connection
echo "Testing database..."
docker run --rm postgres:15-alpine pg_isready -h localhost -U postgres || true

echo ""
echo "=================================="
echo "   Coolify Configuration"
echo "=================================="
echo ""
echo "1. In Coolify Dashboard:"
echo "   - Application Type: Docker Compose"
echo "   - Docker Compose File: docker-compose.yml (in root)"
echo "   - Base Directory: leave empty"
echo ""
echo "2. Environment Variables (copy from deployment/.env.coolify):"
cat deployment/.env.coolify
echo ""
echo "3. Exposed Ports:"
echo "   - API: 5104"
echo "   - Web: 3000 (if using frontend)"
echo "   - Adminer: 8090 (if using dev profile)"
echo ""
echo "4. Health Check URL: /health"
echo ""
echo "5. To deploy only API and databases (without frontend):"
echo "   Remove or comment out the 'web' service in docker-compose.yml"
echo ""
echo "Ready for Coolify deployment!"
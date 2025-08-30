#!/bin/bash

# MinIO Setup Script for Docker/Coolify
# This script sets up MinIO buckets and users

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== MinIO Setup Script ===${NC}"
echo ""

# Configuration
MINIO_HOST="${MINIO_HOST:-http://localhost:9000}"
MINIO_ROOT_USER="${MINIO_ROOT_USER:-admin}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-StockerMinio2024!}"
MINIO_APP_USER="${MINIO_APP_USER:-stockerapp}"
MINIO_APP_PASSWORD="${MINIO_APP_PASSWORD:-StockerApp2024!}"

# Check if MinIO is running
echo -e "${YELLOW}Checking MinIO status...${NC}"
if curl -s -f "${MINIO_HOST}/minio/health/live" > /dev/null; then
    echo -e "${GREEN}✓ MinIO is running${NC}"
else
    echo -e "${RED}✗ MinIO is not accessible at ${MINIO_HOST}${NC}"
    echo "Please make sure MinIO is running and accessible."
    exit 1
fi

# Run setup using docker
echo -e "${YELLOW}Running MinIO setup...${NC}"

docker run --rm -it \
    --network stocker-network \
    minio/mc:latest \
    sh -c "
        echo 'Configuring MinIO...';
        mc alias set local ${MINIO_HOST} ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD};
        
        echo 'Creating buckets...';
        mc mb --ignore-existing local/stocker-files;
        mc mb --ignore-existing local/stocker-backups;
        mc mb --ignore-existing local/stocker-temp;
        
        echo 'Setting bucket policies...';
        mc policy set download local/stocker-files/public 2>/dev/null || true;
        
        echo 'Creating application user...';
        mc admin user add local ${MINIO_APP_USER} ${MINIO_APP_PASSWORD} 2>/dev/null || echo 'User may already exist';
        mc admin policy set local readwrite user=${MINIO_APP_USER} 2>/dev/null || true;
        
        echo 'Listing buckets...';
        mc ls local/;
        
        echo '';
        echo '=== MinIO Setup Complete ===';
    "

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo -e "${BLUE}MinIO Access Information:${NC}"
echo -e "  Console URL: ${MINIO_HOST%:9000}:9001"
echo -e "  API URL: ${MINIO_HOST}"
echo ""
echo -e "${BLUE}Admin Credentials:${NC}"
echo -e "  Username: ${MINIO_ROOT_USER}"
echo -e "  Password: ${MINIO_ROOT_PASSWORD}"
echo ""
echo -e "${BLUE}Application Credentials:${NC}"
echo -e "  Username: ${MINIO_APP_USER}"
echo -e "  Password: ${MINIO_APP_PASSWORD}"
echo ""
echo -e "${YELLOW}Note: Save these credentials securely!${NC}"
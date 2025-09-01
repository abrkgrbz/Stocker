#!/bin/bash

# Stocker Deployment Script for Coolify
# This script deploys all services in the correct order

set -e

echo "========================================="
echo "Stocker Deployment Script"
echo "========================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if service is healthy
check_service() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    echo -n "Checking $service_name health..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker ps --filter "name=$service_name" --filter "health=healthy" | grep -q $service_name; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e " ${RED}✗${NC}"
    return 1
}

# Deploy infrastructure services
echo -e "\n${YELLOW}1. Deploying Infrastructure Services${NC}"
echo "----------------------------------------"

echo "Deploying SQL Server..."
docker-compose -f infrastructure/01-database.yml up -d
check_service "mssql"

echo "Deploying Redis..."
docker-compose -f infrastructure/02-redis.yml up -d
check_service "redis"

echo "Deploying Seq..."
docker-compose -f infrastructure/03-seq.yml up -d
check_service "seq"

echo "Deploying MinIO (optional)..."
docker-compose -f infrastructure/04-minio.yml up -d 2>/dev/null || true

# Initialize databases
echo -e "\n${YELLOW}2. Initializing Databases${NC}"
echo "----------------------------------------"

echo "Waiting for SQL Server to be fully ready..."
sleep 10

echo "Creating databases..."
docker exec mssql /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P 'YourStrongPassword123!' \
    -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StockerMasterDb') CREATE DATABASE StockerMasterDb;" || true

docker exec mssql /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P 'YourStrongPassword123!' \
    -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StockerTenantDb') CREATE DATABASE StockerTenantDb;" || true

# Deploy applications
echo -e "\n${YELLOW}3. Deploying Applications${NC}"
echo "----------------------------------------"

echo "Deploying API..."
docker-compose -f applications/01-api.yml up -d
check_service "stocker-api"

echo "Deploying Web..."
docker-compose -f applications/02-web.yml up -d
check_service "stocker-web"

# Deploy monitoring (optional)
echo -e "\n${YELLOW}4. Deploying Monitoring (Optional)${NC}"
echo "----------------------------------------"

read -p "Deploy monitoring stack? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying Prometheus..."
    docker-compose -f monitoring/prometheus.yml up -d
    
    echo "Deploying Grafana..."
    docker-compose -f monitoring/grafana.yml up -d
fi

# Summary
echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Services deployed:"
echo "  - SQL Server: port 1433"
echo "  - Redis: port 6379"
echo "  - Seq: https://seq.stoocker.app"
echo "  - API: https://api.stoocker.app"
echo "  - Web: https://stoocker.app"
echo ""
echo "Health check endpoints:"
echo "  - API: https://api.stoocker.app/health"
echo "  - Swagger: https://api.stoocker.app"
echo ""
echo "Default credentials:"
echo "  - SQL Server: sa / YourStrongPassword123!"
echo "  - Seq: admin / StockerSeq2024!"
echo "  - MinIO: admin / MinioPassword123!"
echo ""
echo -e "${YELLOW}Remember to update passwords in production!${NC}"
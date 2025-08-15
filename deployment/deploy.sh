#!/bin/bash

# Stocker Deployment Script
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT=${1:-development}
ACTION=${2:-up}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Stocker Deployment Script${NC}"
echo -e "${BLUE}   Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}   Action: ${ACTION}${NC}"
echo -e "${BLUE}========================================${NC}"

# Functions
check_requirements() {
    echo -e "${YELLOW}Checking requirements...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed${NC}"
        exit 1
    fi
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}Docker Compose is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All requirements met${NC}"
}

setup_environment() {
    echo -e "${YELLOW}Setting up environment...${NC}"
    
    # Copy environment file
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ ! -f .env.production ]; then
            echo -e "${RED}.env.production not found${NC}"
            exit 1
        fi
        cp .env.production .env
        COMPOSE_FILE="docker-compose.production.yml"
    elif [ "$ENVIRONMENT" = "coolify" ]; then
        if [ ! -f .env.development ]; then
            cp .env.development .env
        fi
        COMPOSE_FILE="docker-compose.coolify.yml"
    else
        if [ ! -f .env.development ]; then
            echo -e "${YELLOW}Creating .env from template...${NC}"
            cp .env.development .env
        fi
        COMPOSE_FILE="docker-compose.coolify.yml"
    fi
    
    echo -e "${GREEN}✓ Environment configured${NC}"
}

build_containers() {
    echo -e "${YELLOW}Building containers...${NC}"
    docker compose -f $COMPOSE_FILE build --no-cache
    echo -e "${GREEN}✓ Containers built${NC}"
}

start_services() {
    echo -e "${YELLOW}Starting services...${NC}"
    docker compose -f $COMPOSE_FILE up -d
    echo -e "${GREEN}✓ Services started${NC}"
}

stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    docker compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✓ Services stopped${NC}"
}

restart_services() {
    echo -e "${YELLOW}Restarting services...${NC}"
    docker compose -f $COMPOSE_FILE restart
    echo -e "${GREEN}✓ Services restarted${NC}"
}

show_logs() {
    echo -e "${YELLOW}Showing logs...${NC}"
    docker compose -f $COMPOSE_FILE logs -f
}

run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations
    docker exec stocker-api dotnet ef database update --context MasterDbContext || echo "Master migration may already be applied"
    docker exec stocker-api dotnet ef database update --context TenantDbContext || echo "Tenant migration may already be applied"
    
    echo -e "${GREEN}✓ Migrations completed${NC}"
}

health_check() {
    echo -e "${YELLOW}Running health checks...${NC}"
    
    # Wait for services to start
    sleep 15
    
    # Check API
    if curl -f http://localhost:5104/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API is healthy${NC}"
    else
        echo -e "${RED}✗ API is not responding${NC}"
    fi
    
    # Check Database
    if docker exec stocker-db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is healthy${NC}"
    else
        echo -e "${RED}✗ Database is not responding${NC}"
    fi
    
    # Check Redis
    if docker exec stocker-redis redis-cli -a Redis2024! ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis is healthy${NC}"
    else
        echo -e "${RED}✗ Redis is not responding${NC}"
    fi
    
    # Show running containers
    echo ""
    echo -e "${BLUE}Running containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

show_urls() {
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   Deployment Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Access URLs:${NC}"
    echo -e "API:      ${GREEN}http://${SERVER_IP}:5104${NC}"
    echo -e "Swagger:  ${GREEN}http://${SERVER_IP}:5104/swagger${NC}"
    echo -e "Web App:  ${GREEN}http://${SERVER_IP}:3000${NC}"
    echo -e "Adminer:  ${GREEN}http://${SERVER_IP}:8090${NC}"
    echo ""
    echo -e "${BLUE}Database Connection:${NC}"
    echo -e "Host:     ${GREEN}${SERVER_IP}${NC}"
    echo -e "Port:     ${GREEN}5432${NC}"
    echo -e "Username: ${GREEN}postgres${NC}"
    echo -e "Password: ${GREEN}StockerDb2024!${NC}"
    echo ""
}

# Main execution
check_requirements
setup_environment

case "$ACTION" in
    up)
        start_services
        run_migrations
        health_check
        show_urls
        ;;
    down)
        stop_services
        ;;
    restart)
        restart_services
        health_check
        ;;
    build)
        build_containers
        ;;
    rebuild)
        stop_services
        build_containers
        start_services
        run_migrations
        health_check
        show_urls
        ;;
    logs)
        show_logs
        ;;
    health)
        health_check
        ;;
    *)
        echo -e "${RED}Invalid action: $ACTION${NC}"
        echo "Usage: $0 [development|production|coolify] [up|down|restart|build|rebuild|logs|health]"
        exit 1
        ;;
esac
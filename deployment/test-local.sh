#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Stocker Local Test Environment${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker is running${NC}"
}

# Function to check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${YELLOW}docker-compose not found, trying docker compose...${NC}"
        if ! docker compose version > /dev/null 2>&1; then
            echo -e "${RED}Docker Compose is not installed.${NC}"
            exit 1
        fi
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    echo -e "${GREEN}✓ Docker Compose is available${NC}"
}

# Function to stop and clean up
cleanup() {
    echo -e "${YELLOW}Stopping all containers...${NC}"
    $DOCKER_COMPOSE down
    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

# Function to build and start services
start_services() {
    echo -e "${YELLOW}Building services...${NC}"
    $DOCKER_COMPOSE build --no-cache
    
    echo -e "${YELLOW}Starting services...${NC}"
    $DOCKER_COMPOSE up -d
    
    echo -e "${GREEN}✓ Services started${NC}"
}

# Function to wait for services
wait_for_services() {
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    
    # Wait for PostgreSQL
    echo -n "Waiting for PostgreSQL..."
    for i in {1..30}; do
        if docker exec stocker-db pg_isready -U postgres > /dev/null 2>&1; then
            echo -e " ${GREEN}Ready${NC}"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    # Wait for API
    echo -n "Waiting for API..."
    for i in {1..30}; do
        if curl -f http://localhost:5104/health > /dev/null 2>&1; then
            echo -e " ${GREEN}Ready${NC}"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    # Wait for Web
    echo -n "Waiting for Web..."
    for i in {1..30}; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            echo -e " ${GREEN}Ready${NC}"
            break
        fi
        echo -n "."
        sleep 2
    done
}

# Function to run migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    
    # Wait a bit more for API to fully initialize
    sleep 5
    
    # Run migrations via API container
    docker exec stocker-api dotnet ef database update --context MasterDbContext || echo "Master migration may already be applied"
    docker exec stocker-api dotnet ef database update --context TenantDbContext || echo "Tenant migration may already be applied"
    
    echo -e "${GREEN}✓ Migrations complete${NC}"
}

# Function to show status
show_status() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   Service Status${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   Access URLs${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "Web Application:  ${GREEN}http://localhost:3000${NC}"
    echo -e "API Swagger:      ${GREEN}http://localhost:5104/swagger${NC}"
    echo -e "SignalR Test:     ${GREEN}http://localhost:3000/signalr-test${NC}"
    echo -e "Database Admin:   ${GREEN}http://localhost:8080${NC}"
    echo -e "                  Server: ${YELLOW}postgres${NC}"
    echo -e "                  Username: ${YELLOW}postgres${NC}"
    echo -e "                  Password: ${YELLOW}StockerDb2024!${NC}"
    echo ""
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}Showing logs (Ctrl+C to stop)...${NC}"
    $DOCKER_COMPOSE logs -f
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   Select an option:${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo "1) Start all services"
    echo "2) Stop all services"
    echo "3) Restart all services"
    echo "4) Show status"
    echo "5) Show logs"
    echo "6) Run migrations"
    echo "7) Clean and rebuild"
    echo "8) Open Web App"
    echo "9) Open API Swagger"
    echo "0) Exit"
    echo ""
    read -p "Enter your choice: " choice
}

# Change to script directory
cd "$(dirname "$0")/.." || exit 1

# Check prerequisites
check_docker
check_docker_compose

# Main loop
while true; do
    show_menu
    
    case $choice in
        1)
            start_services
            wait_for_services
            run_migrations
            show_status
            ;;
        2)
            cleanup
            ;;
        3)
            cleanup
            start_services
            wait_for_services
            run_migrations
            show_status
            ;;
        4)
            show_status
            ;;
        5)
            show_logs
            ;;
        6)
            run_migrations
            ;;
        7)
            cleanup
            echo -e "${YELLOW}Removing volumes...${NC}"
            docker volume rm stocker_postgres-data 2>/dev/null || true
            start_services
            wait_for_services
            run_migrations
            show_status
            ;;
        8)
            echo -e "${YELLOW}Opening Web App...${NC}"
            if command -v xdg-open &> /dev/null; then
                xdg-open http://localhost:3000
            elif command -v open &> /dev/null; then
                open http://localhost:3000
            else
                echo -e "${YELLOW}Please open http://localhost:3000 in your browser${NC}"
            fi
            ;;
        9)
            echo -e "${YELLOW}Opening API Swagger...${NC}"
            if command -v xdg-open &> /dev/null; then
                xdg-open http://localhost:5104/swagger
            elif command -v open &> /dev/null; then
                open http://localhost:5104/swagger
            else
                echo -e "${YELLOW}Please open http://localhost:5104/swagger in your browser${NC}"
            fi
            ;;
        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
done
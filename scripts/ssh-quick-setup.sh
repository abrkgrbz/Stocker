#!/bin/bash

# Quick SSH setup script for Coolify deployment
# Run this after SSH'ing into your server

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Stocker Coolify Quick Setup ===${NC}"
echo ""

# Find service directory
echo -e "${YELLOW}Looking for Coolify service directories...${NC}"
if [ -d "/data/coolify/services" ]; then
    echo -e "${GREEN}Found Coolify services directory${NC}"
    echo ""
    echo "Available services:"
    ls -la /data/coolify/services/
    echo ""
    read -p "Enter your service ID (directory name): " SERVICE_ID
    
    if [ -d "/data/coolify/services/$SERVICE_ID" ]; then
        cd "/data/coolify/services/$SERVICE_ID"
        echo -e "${GREEN}✓ Changed to service directory${NC}"
    else
        echo -e "${RED}Service directory not found!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Coolify services directory not found. Trying current directory...${NC}"
fi

# Check if we're in the right place
if [ ! -f "docker-compose.nginx-coolify.yml" ] && [ ! -f "scripts/setup-coolify-services.sh" ]; then
    echo -e "${RED}This doesn't look like the Stocker project directory!${NC}"
    echo "Current directory: $(pwd)"
    echo ""
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Make scripts executable
echo -e "${YELLOW}Making scripts executable...${NC}"
chmod +x scripts/*.sh 2>/dev/null || echo "No scripts found in scripts/ directory"
echo -e "${GREEN}✓ Scripts are executable${NC}"

# Create network
echo -e "${YELLOW}Creating Docker network...${NC}"
docker network create stocker-network 2>/dev/null && echo -e "${GREEN}✓ Network created${NC}" || echo -e "${YELLOW}Network already exists${NC}"

# Check for environment variables
echo ""
echo -e "${YELLOW}Checking environment variables...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file found${NC}"
    echo ""
    echo "Current environment variables:"
    grep -E "^[A-Z_]+=" .env | head -10
    echo "..."
else
    echo -e "${YELLOW}.env file not found${NC}"
fi

# Menu
echo ""
echo -e "${BLUE}What would you like to do?${NC}"
echo "1) Run full setup script"
echo "2) Build Docker images"
echo "3) View Docker containers status"
echo "4) View logs"
echo "5) Create basic auth (.htpasswd)"
echo "6) Exit"
echo ""
read -p "Select option (1-6): " option

case $option in
    1)
        echo -e "${YELLOW}Running setup script...${NC}"
        if [ -f "scripts/setup-coolify-services.sh" ]; then
            bash scripts/setup-coolify-services.sh
        else
            echo -e "${RED}Setup script not found!${NC}"
        fi
        ;;
    2)
        echo -e "${YELLOW}Building Docker images...${NC}"
        [ -f "nginx/Dockerfile" ] && docker build -t stocker-nginx:latest ./nginx/
        [ -f "prometheus/Dockerfile" ] && docker build -t stocker-prometheus:latest ./prometheus/
        [ -f "grafana/Dockerfile" ] && docker build -t stocker-grafana:latest ./grafana/
        [ -f "alertmanager/Dockerfile" ] && docker build -t stocker-alertmanager:latest ./alertmanager/
        echo -e "${GREEN}✓ Images built${NC}"
        ;;
    3)
        echo -e "${YELLOW}Docker containers status:${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        ;;
    4)
        echo -e "${YELLOW}Available containers:${NC}"
        docker ps --format "{{.Names}}"
        echo ""
        read -p "Enter container name to view logs: " container_name
        docker logs --tail 50 -f "$container_name"
        ;;
    5)
        echo -e "${YELLOW}Creating basic auth file...${NC}"
        read -p "Enter username (default: admin): " username
        username=${username:-admin}
        password=$(openssl rand -base64 12)
        docker run --rm -i httpd:alpine htpasswd -nb "$username" "$password" > ./nginx/.htpasswd
        echo -e "${GREEN}Basic auth created:${NC}"
        echo "  Username: $username"
        echo "  Password: $password"
        echo -e "${YELLOW}Save this password!${NC}"
        ;;
    6)
        echo -e "${GREEN}Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Make sure all environment variables are set in Coolify"
echo "2. Deploy services one by one from Coolify dashboard"
echo "3. Check service logs if anything fails"
echo ""
echo -e "${GREEN}Good luck!${NC}"
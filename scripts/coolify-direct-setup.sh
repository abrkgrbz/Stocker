#!/bin/bash

# Direct setup script for Coolify - runs without needing specific directory structure
# This script can be run from anywhere on the server

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Stocker Coolify Direct Setup ===${NC}"
echo ""

# Create network
echo -e "${YELLOW}Creating Docker network...${NC}"
docker network create stocker-network 2>/dev/null && echo -e "${GREEN}✓ Network created${NC}" || echo -e "${YELLOW}Network already exists or using Coolify's network${NC}"

# Check for Coolify's network
if docker network ls | grep -q "coolify"; then
    echo -e "${GREEN}✓ Found Coolify network${NC}"
    NETWORK_NAME="coolify"
else
    NETWORK_NAME="stocker-network"
fi

echo ""
echo -e "${BLUE}Quick Actions Menu${NC}"
echo "1) View all Docker containers"
echo "2) View Stocker-related containers"
echo "3) Check Docker networks"
echo "4) View container logs"
echo "5) Create basic auth file"
echo "6) Test service connectivity"
echo "7) Build custom images from GitHub"
echo "8) Exit"
echo ""
read -p "Select option (1-8): " option

case $option in
    1)
        echo -e "${YELLOW}All Docker containers:${NC}"
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}\t{{.Ports}}"
        ;;
    2)
        echo -e "${YELLOW}Stocker-related containers:${NC}"
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}\t{{.Ports}}" | grep -E "(stocker|nginx|minio|grafana|prometheus|rabbitmq|seq|elastic|kibana)" || echo "No Stocker containers found"
        ;;
    3)
        echo -e "${YELLOW}Docker networks:${NC}"
        docker network ls
        echo ""
        echo -e "${YELLOW}Containers in $NETWORK_NAME network:${NC}"
        docker network inspect $NETWORK_NAME --format '{{range .Containers}}{{println .Name}}{{end}}' 2>/dev/null || echo "Network not found"
        ;;
    4)
        echo -e "${YELLOW}Available containers:${NC}"
        docker ps --format "{{.Names}}"
        echo ""
        read -p "Enter container name to view logs: " container_name
        docker logs --tail 100 -f "$container_name"
        ;;
    5)
        echo -e "${YELLOW}Creating basic auth file...${NC}"
        read -p "Enter username (default: admin): " username
        username=${username:-admin}
        password=$(openssl rand -base64 12)
        
        # Create in /tmp first
        docker run --rm -i httpd:alpine htpasswd -nb "$username" "$password" > /tmp/.htpasswd
        
        echo -e "${GREEN}Basic auth created:${NC}"
        echo "  Username: $username"
        echo "  Password: $password"
        echo "  File saved to: /tmp/.htpasswd"
        echo ""
        echo -e "${YELLOW}Copy this file to your nginx config directory when needed${NC}"
        echo -e "${YELLOW}IMPORTANT: Save this password in a secure location!${NC}"
        ;;
    6)
        echo -e "${YELLOW}Testing service connectivity...${NC}"
        
        # Test internal DNS
        echo -e "\n${BLUE}Testing DNS resolution:${NC}"
        docker run --rm --network $NETWORK_NAME alpine nslookup stocker-web 2>/dev/null && echo -e "${GREEN}✓ stocker-web resolves${NC}" || echo -e "${RED}✗ stocker-web not found${NC}"
        docker run --rm --network $NETWORK_NAME alpine nslookup api 2>/dev/null && echo -e "${GREEN}✓ api resolves${NC}" || echo -e "${RED}✗ api not found${NC}"
        docker run --rm --network $NETWORK_NAME alpine nslookup minio 2>/dev/null && echo -e "${GREEN}✓ minio resolves${NC}" || echo -e "${RED}✗ minio not found${NC}"
        
        # Test port connectivity
        echo -e "\n${BLUE}Testing port connectivity:${NC}"
        docker run --rm --network $NETWORK_NAME alpine sh -c "nc -zv stocker-web 80 2>&1" | grep -q "succeeded" && echo -e "${GREEN}✓ stocker-web:80 accessible${NC}" || echo -e "${RED}✗ stocker-web:80 not accessible${NC}"
        docker run --rm --network $NETWORK_NAME alpine sh -c "nc -zv api 5000 2>&1" | grep -q "succeeded" && echo -e "${GREEN}✓ api:5000 accessible${NC}" || echo -e "${RED}✗ api:5000 not accessible${NC}"
        ;;
    7)
        echo -e "${YELLOW}Building custom images from GitHub...${NC}"
        
        # Clone to temp directory
        TEMP_DIR="/tmp/stocker-build-$(date +%s)"
        echo -e "${YELLOW}Cloning repository to $TEMP_DIR...${NC}"
        git clone https://github.com/abrkgrbz/Stocker.git $TEMP_DIR
        cd $TEMP_DIR
        
        # Build images
        echo -e "${YELLOW}Building Docker images...${NC}"
        
        if [ -f "nginx/Dockerfile" ]; then
            echo -e "${YELLOW}Building Nginx...${NC}"
            docker build -t stocker-nginx:latest ./nginx/
        fi
        
        if [ -f "prometheus/Dockerfile" ]; then
            echo -e "${YELLOW}Building Prometheus...${NC}"
            docker build -t stocker-prometheus:latest ./prometheus/
        fi
        
        if [ -f "grafana/Dockerfile" ]; then
            echo -e "${YELLOW}Building Grafana...${NC}"
            docker build -t stocker-grafana:latest ./grafana/
        fi
        
        if [ -f "alertmanager/Dockerfile" ]; then
            echo -e "${YELLOW}Building AlertManager...${NC}"
            docker build -t stocker-alertmanager:latest ./alertmanager/
        fi
        
        echo -e "${GREEN}✓ Images built successfully${NC}"
        echo -e "${YELLOW}Cleaning up...${NC}"
        cd /
        rm -rf $TEMP_DIR
        
        echo ""
        echo -e "${GREEN}Built images:${NC}"
        docker images | grep stocker
        ;;
    8)
        echo -e "${GREEN}Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=== Operation Complete ===${NC}"
echo ""

# Show helpful information
echo -e "${YELLOW}Useful Commands:${NC}"
echo "• View all containers: docker ps -a"
echo "• View logs: docker logs [container-name]"
echo "• Enter container: docker exec -it [container-name] /bin/sh"
echo "• Restart container: docker restart [container-name]"
echo "• Check network: docker network inspect $NETWORK_NAME"
echo ""
echo -e "${YELLOW}Coolify Tips:${NC}"
echo "• Services are in: /data/coolify/services/"
echo "• Proxy configs are managed by Traefik"
echo "• Environment variables are in Coolify dashboard"
echo "• Deployments trigger from GitHub pushes"
echo ""
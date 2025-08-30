#!/bin/bash

# Setup script for Coolify services
# This script helps prepare and deploy services to Coolify

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Stocker Coolify Services Setup ===${NC}"
echo ""

# Function to check if docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}Docker is not running or not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker is running${NC}"
}

# Function to create network if not exists
create_network() {
    if docker network ls | grep -q "stocker-network"; then
        echo -e "${GREEN}✓ Network 'stocker-network' already exists${NC}"
    else
        echo -e "${YELLOW}Creating network 'stocker-network'...${NC}"
        docker network create stocker-network
        echo -e "${GREEN}✓ Network created${NC}"
    fi
}

# Function to build custom images
build_images() {
    echo -e "${YELLOW}Building custom Docker images...${NC}"
    
    # Build Nginx image
    if [ -f "./nginx/Dockerfile" ]; then
        echo -e "${YELLOW}Building Nginx image...${NC}"
        docker build -t stocker-nginx:latest ./nginx/
        echo -e "${GREEN}✓ Nginx image built${NC}"
    fi
    
    # Build Prometheus image
    if [ -f "./prometheus/Dockerfile" ]; then
        echo -e "${YELLOW}Building Prometheus image...${NC}"
        docker build -t stocker-prometheus:latest ./prometheus/
        echo -e "${GREEN}✓ Prometheus image built${NC}"
    fi
    
    # Build Grafana image
    if [ -f "./grafana/Dockerfile" ]; then
        echo -e "${YELLOW}Building Grafana image...${NC}"
        docker build -t stocker-grafana:latest ./grafana/
        echo -e "${GREEN}✓ Grafana image built${NC}"
    fi
    
    # Build AlertManager image
    if [ -f "./alertmanager/Dockerfile" ]; then
        echo -e "${YELLOW}Building AlertManager image...${NC}"
        docker build -t stocker-alertmanager:latest ./alertmanager/
        echo -e "${GREEN}✓ AlertManager image built${NC}"
    fi
}

# Function to display service information
display_info() {
    echo ""
    echo -e "${GREEN}=== Service Configuration ===${NC}"
    echo ""
    echo -e "${YELLOW}Available Docker Compose files:${NC}"
    echo -e "  • docker-compose.nginx-coolify.yml      - Nginx reverse proxy"
    echo -e "  • docker-compose.minio.yml              - MinIO object storage"
    echo -e "  • docker-compose.rabbitmq.yml           - RabbitMQ message broker"
    echo -e "  • docker-compose.elasticsearch.yml      - ElasticSearch & Kibana"
    echo -e "  • docker-compose.monitoring-coolify.yml - Monitoring stack"
    echo -e "  • docker-compose.mailhog.yml            - Mail testing"
    echo -e "  • docker-compose.seq.yml                - Seq logging"
    echo -e "  • docker-compose.grafana.yml            - Grafana only"
    echo ""
    echo -e "${YELLOW}To deploy in Coolify:${NC}"
    echo -e "1. Push this code to your GitHub repository"
    echo -e "2. In Coolify, create a new service"
    echo -e "3. Select 'Docker Compose' as the source"
    echo -e "4. Connect your GitHub repository"
    echo -e "5. Select the appropriate docker-compose file"
    echo -e "6. Configure environment variables as needed"
    echo -e "7. Deploy the service"
    echo ""
}

# Function to check environment variables
check_env() {
    echo -e "${YELLOW}Checking environment variables...${NC}"
    
    required_vars=(
        "SENDGRID_API_KEY"
        "POSTGRES_CONNECTION"
        "REDIS_CONNECTION"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo -e "${YELLOW}Missing environment variables:${NC}"
        for var in "${missing_vars[@]}"; do
            echo -e "  • $var"
        done
        echo ""
        echo -e "${YELLOW}Make sure to set these in Coolify's environment variables${NC}"
    else
        echo -e "${GREEN}✓ All required environment variables are set${NC}"
    fi
}

# Main execution
echo -e "${YELLOW}Starting setup...${NC}"
echo ""

# Check Docker
check_docker

# Create network
create_network

# Build images
read -p "Do you want to build custom Docker images locally? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    build_images
fi

# Check environment
check_env

# Display information
display_info

echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Commit and push your changes to GitHub"
echo -e "2. Configure services in Coolify"
echo -e "3. Set environment variables in Coolify"
echo -e "4. Deploy services one by one"
echo ""
echo -e "${GREEN}Good luck with your deployment!${NC}"
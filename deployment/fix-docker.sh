#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Docker Fix Script for VPS${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to completely remove Docker
remove_docker() {
    echo -e "${YELLOW}Removing existing Docker installation...${NC}"
    
    # Stop Docker if running
    systemctl stop docker 2>/dev/null
    systemctl stop docker.socket 2>/dev/null
    systemctl stop containerd 2>/dev/null
    
    # Remove Docker packages
    apt-get purge -y docker-ce docker-ce-cli containerd.io docker-compose-plugin 2>/dev/null
    apt-get purge -y docker docker-engine docker.io containerd runc 2>/dev/null
    apt-get autoremove -y
    
    # Remove Docker directories
    rm -rf /var/lib/docker
    rm -rf /var/lib/containerd
    rm -rf /etc/docker
    rm -rf /etc/systemd/system/docker.service
    rm -rf /etc/systemd/system/docker.socket
    
    echo -e "${GREEN}✓ Old Docker installation removed${NC}"
}

# Function to install Docker
install_docker() {
    echo -e "${YELLOW}Installing Docker...${NC}"
    
    # Update package index
    apt-get update
    
    # Install prerequisites
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        software-properties-common
    
    # Add Docker's official GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index again
    apt-get update
    
    # Install Docker Engine
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    echo -e "${GREEN}✓ Docker installed${NC}"
}

# Function to configure Docker
configure_docker() {
    echo -e "${YELLOW}Configuring Docker...${NC}"
    
    # Create docker group if it doesn't exist
    groupadd docker 2>/dev/null || true
    
    # Add current user to docker group
    usermod -aG docker $USER 2>/dev/null || true
    
    # Create Docker daemon config
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF
    
    # Reload systemd
    systemctl daemon-reload
    
    # Enable and start Docker
    systemctl enable docker
    systemctl enable containerd
    systemctl start containerd
    systemctl start docker
    
    echo -e "${GREEN}✓ Docker configured${NC}"
}

# Function to verify Docker
verify_docker() {
    echo -e "${YELLOW}Verifying Docker installation...${NC}"
    
    # Check if Docker daemon is running
    if systemctl is-active --quiet docker; then
        echo -e "${GREEN}✓ Docker daemon is running${NC}"
    else
        echo -e "${RED}✗ Docker daemon is not running${NC}"
        echo -e "${YELLOW}Attempting to start Docker...${NC}"
        systemctl start docker
        sleep 5
    fi
    
    # Check Docker version
    if docker --version > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Docker command works${NC}"
        docker --version
    else
        echo -e "${RED}✗ Docker command not found${NC}"
        return 1
    fi
    
    # Test Docker with hello-world
    echo -e "${YELLOW}Testing Docker with hello-world container...${NC}"
    if docker run --rm hello-world > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Docker can run containers${NC}"
    else
        echo -e "${RED}✗ Docker cannot run containers${NC}"
        return 1
    fi
    
    # Check docker-compose
    if docker compose version > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Docker Compose is available${NC}"
        docker compose version
    else
        echo -e "${YELLOW}⚠ Docker Compose not found, installing...${NC}"
        apt-get install -y docker-compose-plugin
    fi
    
    return 0
}

# Function to fix common Docker issues
fix_docker_issues() {
    echo -e "${YELLOW}Fixing common Docker issues...${NC}"
    
    # Fix socket permissions
    chmod 666 /var/run/docker.sock 2>/dev/null || true
    
    # Clear any corrupted networks
    docker network prune -f 2>/dev/null || true
    
    # Clear any corrupted volumes
    docker volume prune -f 2>/dev/null || true
    
    # Restart Docker
    systemctl restart docker
    sleep 5
    
    echo -e "${GREEN}✓ Common issues fixed${NC}"
}

# Main execution
echo -e "${BLUE}Starting Docker fix process...${NC}"

# Check if Docker is installed but not working
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is installed, checking status...${NC}"
    
    if ! docker ps > /dev/null 2>&1; then
        echo -e "${RED}Docker is not working properly${NC}"
        
        # Try to fix first
        echo -e "${YELLOW}Attempting to fix Docker...${NC}"
        systemctl restart docker
        sleep 5
        
        if ! docker ps > /dev/null 2>&1; then
            echo -e "${RED}Fix failed, reinstalling Docker...${NC}"
            remove_docker
            install_docker
            configure_docker
        else
            echo -e "${GREEN}✓ Docker fixed without reinstall${NC}"
        fi
    else
        echo -e "${GREEN}✓ Docker is working${NC}"
    fi
else
    echo -e "${YELLOW}Docker not found, installing...${NC}"
    install_docker
    configure_docker
fi

# Final verification
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Final Verification${NC}"
echo -e "${BLUE}========================================${NC}"

if verify_docker; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   Docker Fixed Successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Docker Status:${NC}"
    systemctl status docker --no-pager | head -10
    echo ""
    echo -e "${YELLOW}Docker Info:${NC}"
    docker info | grep -E "Server Version|Storage Driver|Cgroup Driver"
    echo ""
    echo -e "${GREEN}You can now continue with Coolify installation${NC}"
    echo -e "${YELLOW}Run: ${NC}${BLUE}./setup-coolify.sh${NC}"
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}   Docker Fix Failed${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Please try manual fix:${NC}"
    echo "1. Check system logs: journalctl -xe"
    echo "2. Check Docker logs: journalctl -u docker.service"
    echo "3. Check disk space: df -h"
    echo "4. Check memory: free -h"
    echo ""
    echo -e "${YELLOW}System Info:${NC}"
    uname -a
    lsb_release -a 2>/dev/null || cat /etc/os-release
    
    exit 1
fi
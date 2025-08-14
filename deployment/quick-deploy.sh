#!/bin/bash

# Quick deployment script for Hetzner VPS
# This script automates the entire setup process

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
GITHUB_REPO="https://github.com/YOUR_USERNAME/Stocker.git"
GITHUB_TOKEN=""  # Add your token here if private repo
DOMAIN_WEB="test.stocker.app"
DOMAIN_API="api.test.stocker.app"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Stocker Quick Deploy for Hetzner${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo -e "${GREEN}Server IP: ${SERVER_IP}${NC}"

# Step 1: System Update
echo -e "${YELLOW}Step 1: Updating system...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git nano htop net-tools ufw

# Step 2: Set timezone
echo -e "${YELLOW}Step 2: Setting timezone to Istanbul...${NC}"
timedatectl set-timezone Europe/Istanbul

# Step 3: Install Docker
echo -e "${YELLOW}Step 3: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
fi
docker --version

# Step 4: Configure Firewall
echo -e "${YELLOW}Step 4: Configuring firewall...${NC}"
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8000/tcp  # Coolify
ufw allow 5104/tcp  # API
ufw allow 3000/tcp  # Web
ufw allow 8080/tcp  # Adminer
ufw --force enable

# Step 5: Clone Repository
echo -e "${YELLOW}Step 5: Cloning repository...${NC}"
cd /opt
if [ -d "stocker" ]; then
    echo "Repository already exists, pulling latest..."
    cd stocker
    git pull
else
    if [ -z "$GITHUB_TOKEN" ]; then
        git clone $GITHUB_REPO stocker
    else
        git clone https://${GITHUB_TOKEN}@${GITHUB_REPO#https://} stocker
    fi
    cd stocker
fi

# Step 6: Create necessary directories
echo -e "${YELLOW}Step 6: Creating directories...${NC}"
mkdir -p /app/stocker/{logs,backups,data}

# Step 7: Install Coolify (Optional)
read -p "Do you want to install Coolify? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Installing Coolify...${NC}"
    curl -fsSL https://get.coolify.io | bash
    sleep 30
fi

# Step 8: Start Services with Docker Compose
echo -e "${YELLOW}Step 8: Starting services...${NC}"
cd /opt/stocker

# Create .env file from example
if [ ! -f ".env" ]; then
    cp .env.example .env
    # Update .env with actual values
    sed -i "s|localhost|${SERVER_IP}|g" .env
fi

# Build and start services
docker compose -f deployment/docker-compose.yml down 2>/dev/null || true
docker compose -f deployment/docker-compose.yml build --no-cache
docker compose -f deployment/docker-compose.yml up -d

# Step 9: Wait for services
echo -e "${YELLOW}Step 9: Waiting for services to start...${NC}"
sleep 20

# Check PostgreSQL
echo -n "Checking PostgreSQL..."
for i in {1..30}; do
    if docker exec stocker-db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e " ${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Check API
echo -n "Checking API..."
for i in {1..30}; do
    if curl -f http://localhost:5104/health > /dev/null 2>&1; then
        echo -e " ${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Step 10: Run Database Migrations
echo -e "${YELLOW}Step 10: Running database migrations...${NC}"
docker exec stocker-api dotnet ef database update --context MasterDbContext || echo "Master migration may already be applied"
docker exec stocker-api dotnet ef database update --context TenantDbContext || echo "Tenant migration may already be applied"

# Step 11: Setup Monitoring and Backup Scripts
echo -e "${YELLOW}Step 11: Setting up monitoring and backup...${NC}"

# Copy scripts
cp deployment/monitor.sh /app/stocker/
cp deployment/backup.sh /app/stocker/ 2>/dev/null || cat > /app/stocker/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/app/stocker/backups"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec stocker-db pg_dumpall -U postgres > $BACKUP_DIR/postgres_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /app/stocker/*.sh

# Add backup to crontab
(crontab -l 2>/dev/null | grep -v "/app/stocker/backup.sh"; echo "0 3 * * * /app/stocker/backup.sh") | crontab -

# Step 12: Create Health Check Script
cat > /app/stocker/health-check.sh << 'EOF'
#!/bin/bash
echo "Health Check Report - $(date)"
echo "================================"

# Check services
check_service() {
    local url=$1
    local name=$2
    if curl -f -s $url > /dev/null; then
        echo "✓ $name is healthy"
    else
        echo "✗ $name is down"
    fi
}

check_service "http://localhost:5104/health" "API"
check_service "http://localhost:3000" "Web App"

# Docker status
echo ""
echo "Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}"
EOF

chmod +x /app/stocker/health-check.sh

# Step 13: Install SSL (Optional)
read -p "Do you want to install SSL certificates? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Installing Certbot...${NC}"
    apt install -y certbot python3-certbot-nginx
    
    read -p "Enter your domain (e.g., test.stocker.app): " domain
    read -p "Enter your email for SSL: " email
    
    certbot certonly --standalone -d $domain -d api.$domain --non-interactive --agree-tos -m $email
fi

# Step 14: Final Health Check
echo -e "${YELLOW}Step 14: Running final health check...${NC}"
/app/stocker/health-check.sh

# Display Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "Web App:        ${GREEN}http://${SERVER_IP}:3000${NC}"
echo -e "API Swagger:    ${GREEN}http://${SERVER_IP}:5104/swagger${NC}"
echo -e "SignalR Test:   ${GREEN}http://${SERVER_IP}:3000/signalr-test${NC}"
echo -e "Database Admin: ${GREEN}http://${SERVER_IP}:8080${NC}"
if command -v docker ps | grep -q coolify; then
    echo -e "Coolify:        ${GREEN}http://${SERVER_IP}:8000${NC}"
fi
echo ""
echo -e "${BLUE}Default Credentials:${NC}"
echo -e "Admin:     ${YELLOW}admin@stocker.test / Admin@2024!${NC}"
echo -e "Database:  ${YELLOW}postgres / StockerDb2024!${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "View logs:      ${YELLOW}docker logs stocker-api -f${NC}"
echo -e "Health check:   ${YELLOW}/app/stocker/health-check.sh${NC}"
echo -e "Manual backup:  ${YELLOW}/app/stocker/backup.sh${NC}"
echo -e "Monitor:        ${YELLOW}/app/stocker/monitor.sh --continuous${NC}"
echo ""
echo -e "${GREEN}Setup complete! Your test environment is ready.${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Save these URLs and credentials!${NC}"

# Save deployment info
cat > /root/stocker-deployment-info.txt << EOF
Stocker Test Environment Deployment Info
=========================================
Date: $(date)
Server IP: ${SERVER_IP}

URLs:
- Web App: http://${SERVER_IP}:3000
- API: http://${SERVER_IP}:5104
- Swagger: http://${SERVER_IP}:5104/swagger
- Database Admin: http://${SERVER_IP}:8080

Credentials:
- Admin: admin@stocker.test / Admin@2024!
- Database: postgres / StockerDb2024!

Commands:
- Health Check: /app/stocker/health-check.sh
- Backup: /app/stocker/backup.sh
- Logs: docker logs stocker-api -f
EOF

echo -e "${GREEN}Deployment info saved to: /root/stocker-deployment-info.txt${NC}"
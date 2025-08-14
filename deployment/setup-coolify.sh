#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Stocker Test Environment Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}" 
   exit 1
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo -e "${YELLOW}Server IP: ${SERVER_IP}${NC}"

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt update && apt upgrade -y

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
apt install -y curl git wget ufw

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8000/tcp  # Coolify Dashboard
ufw allow 5104/tcp  # API
ufw allow 3000/tcp  # Web App
ufw --force enable

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
fi

# Install Coolify
echo -e "${GREEN}Installing Coolify...${NC}"
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Wait for Coolify to start
echo -e "${YELLOW}Waiting for Coolify to start...${NC}"
sleep 30

# Check if Coolify is running
if docker ps | grep -q coolify; then
    echo -e "${GREEN}Coolify is running!${NC}"
    echo -e "${YELLOW}Coolify containers:${NC}"
    docker ps | grep coolify
else
    echo -e "${RED}Coolify containers are not running. Checking Docker...${NC}"
    docker ps -a | grep coolify
    echo -e "${YELLOW}Check Coolify logs with: docker logs coolify${NC}"
    exit 1
fi

# Create deployment directories
echo -e "${YELLOW}Creating deployment directories...${NC}"
mkdir -p /app/stocker/{logs,backups,data}

# Create backup script
echo -e "${YELLOW}Creating backup script...${NC}"
cat > /app/stocker/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/app/stocker/backups"

# Backup PostgreSQL
docker exec stocker-db pg_dumpall -U postgres > $BACKUP_DIR/postgres_$DATE.sql

# Backup Redis
docker exec stocker-redis redis-cli --rdb $BACKUP_DIR/redis_$DATE.rdb

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /app/stocker/backup.sh

# Add backup to crontab
echo -e "${YELLOW}Setting up automatic backups...${NC}"
(crontab -l 2>/dev/null; echo "0 3 * * * /app/stocker/backup.sh") | crontab -

# Create health check script
echo -e "${YELLOW}Creating health check script...${NC}"
cat > /app/stocker/health-check.sh << 'EOF'
#!/bin/bash

API_URL="http://localhost:5104/health"
WEB_URL="http://localhost:3000"
SIGNALR_URL="http://localhost:5104/hubs/validation"

check_service() {
    local url=$1
    local name=$2
    
    if curl -f -s $url > /dev/null; then
        echo "✓ $name is healthy"
        return 0
    else
        echo "✗ $name is down"
        return 1
    fi
}

echo "Health Check Report - $(date)"
echo "================================"
check_service $API_URL "API"
check_service $WEB_URL "Web App"
check_service $SIGNALR_URL "SignalR Hub"

echo ""
echo "Container Status:"
echo "================================"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Resource Usage:"
echo "================================"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
EOF

chmod +x /app/stocker/health-check.sh

# Create quick deploy script
echo -e "${YELLOW}Creating quick deploy script...${NC}"
cat > /app/stocker/deploy.sh << 'EOF'
#!/bin/bash

cd /app/stocker

# Pull latest changes
git pull origin main

# Deploy with docker-compose
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
sleep 10

# Run migrations
docker exec stocker-api dotnet ef database update --context MasterDbContext
docker exec stocker-api dotnet ef database update --context TenantDbContext

# Health check
/app/stocker/health-check.sh
EOF

chmod +x /app/stocker/deploy.sh

# Display summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Access URLs:${NC}"
echo -e "Coolify Dashboard: ${GREEN}http://${SERVER_IP}:8000${NC}"
echo -e "API Swagger: ${GREEN}http://${SERVER_IP}:5104/swagger${NC}"
echo -e "Web App: ${GREEN}http://${SERVER_IP}:3000${NC}"
echo -e "Database Admin: ${GREEN}http://${SERVER_IP}:8080${NC}"
echo ""
echo -e "${YELLOW}Default Credentials:${NC}"
echo -e "Database: postgres / StockerDb2024!"
echo -e "Redis: Redis2024!"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "View logs: ${GREEN}docker logs stocker-api -f${NC}"
echo -e "Health check: ${GREEN}/app/stocker/health-check.sh${NC}"
echo -e "Deploy update: ${GREEN}/app/stocker/deploy.sh${NC}"
echo -e "Manual backup: ${GREEN}/app/stocker/backup.sh${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Open Coolify Dashboard and create admin account"
echo "2. Connect your GitHub repository"
echo "3. Configure environment variables"
echo "4. Deploy your application"
echo ""
echo -e "${GREEN}Happy Testing! 🚀${NC}"

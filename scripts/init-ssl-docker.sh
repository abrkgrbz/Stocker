#!/bin/bash

# SSL Certificate initialization script for Docker Nginx
# This script configures SSL for Nginx running in Docker container

set -e

# Configuration
DOMAIN="stoocker.app"
EMAIL="admin@stoocker.app"
STAGING=0 # Set to 1 for testing with Let's Encrypt staging server

# Subdomains to include in the certificate
SUBDOMAINS=(
    "www.stoocker.app"
    "api.stoocker.app"
    "minio.stoocker.app"
    "s3.stoocker.app"
    "grafana.stoocker.app"
    "prometheus.stoocker.app"
    "alerts.stoocker.app"
    "rabbitmq.stoocker.app"
    "kibana.stoocker.app"
    "seq.stoocker.app" 
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Docker Nginx SSL Certificate Initialization ===${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Find nginx container
echo -e "${YELLOW}Looking for Nginx container...${NC}"
NGINX_CONTAINER=$(docker ps --format "{{.Names}}" | grep nginx | head -1)

if [ -z "$NGINX_CONTAINER" ]; then
    echo -e "${RED}No running Nginx container found!${NC}"
    echo "Available containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    exit 1
fi

echo -e "${GREEN}Found Nginx container: $NGINX_CONTAINER${NC}"

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing certbot...${NC}"
    apt update && apt install certbot -y
fi

# Build domain parameters for certbot
DOMAIN_ARGS="-d ${DOMAIN}"
for subdomain in "${SUBDOMAINS[@]}"; do
    DOMAIN_ARGS="${DOMAIN_ARGS} -d ${subdomain}"
done

# Determine staging flag
STAGING_FLAG=""
if [ $STAGING -eq 1 ]; then
    STAGING_FLAG="--staging"
    echo -e "${YELLOW}Using Let's Encrypt staging server for testing${NC}"
fi

# Check if certificates already exist
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo -e "${YELLOW}Existing certificates found for ${DOMAIN}${NC}"
    read -p "Do you want to renew/overwrite existing certificates? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}Keeping existing certificates${NC}"
        SKIP_CERT=1
    fi
fi

# Request certificate from Let's Encrypt
if [ -z "$SKIP_CERT" ]; then
    echo -e "${YELLOW}Stopping Nginx to free port 80...${NC}"
    docker stop $NGINX_CONTAINER

    echo -e "${YELLOW}Requesting SSL certificate from Let's Encrypt...${NC}"
    certbot certonly --standalone \
        --email ${EMAIL} \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        ${STAGING_FLAG} \
        ${DOMAIN_ARGS}

    echo -e "${YELLOW}Starting Nginx...${NC}"
    docker start $NGINX_CONTAINER

    # Check if certificate was obtained successfully
    if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
        echo -e "${RED}Failed to obtain certificate${NC}"
        exit 1
    fi

    echo -e "${GREEN}SSL certificate obtained successfully!${NC}"
fi

# Create SSL configuration for Nginx
echo -e "${YELLOW}Creating SSL configuration...${NC}"
cat > /tmp/ssl.conf << EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${SUBDOMAINS[@]};
    return 301 https://\$server_name\$request_uri;
}

# Main domain - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/${DOMAIN}/chain.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        set \$backend_host web;
        proxy_pass http://\$backend_host:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# API subdomain - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/${DOMAIN}/chain.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        set \$backend_host api;
        proxy_pass http://\$backend_host:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# MinIO Console - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name minio.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    location / {
        set \$backend_host minio;
        proxy_pass http://\$backend_host:9001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# Grafana - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name grafana.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    location / {
        set \$backend_host grafana;
        proxy_pass http://\$backend_host:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

# Copy SSL configuration to container
echo -e "${YELLOW}Copying SSL configuration to container...${NC}"
docker cp /tmp/ssl.conf $NGINX_CONTAINER:/etc/nginx/conf.d/

# Check if container has access to certificates
echo -e "${YELLOW}Checking certificate access...${NC}"
docker exec $NGINX_CONTAINER ls -la /etc/letsencrypt/live/${DOMAIN}/ 2>/dev/null || {
    echo -e "${YELLOW}Container doesn't have access to certificates. Recreating with volume mount...${NC}"
    
    # Get container image
    IMAGE=$(docker inspect $NGINX_CONTAINER --format='{{.Config.Image}}')
    
    # Get container network
    NETWORK=$(docker inspect $NGINX_CONTAINER --format='{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' | head -1)
    
    # Stop and remove old container
    docker stop $NGINX_CONTAINER
    docker rm $NGINX_CONTAINER
    
    # Recreate with SSL volume
    docker run -d \
        --name $NGINX_CONTAINER \
        --network $NETWORK \
        -p 80:80 \
        -p 443:443 \
        -p 8090:8090 \
        -v /etc/letsencrypt:/etc/letsencrypt:ro \
        $IMAGE
    
    # Copy SSL config again
    sleep 5
    docker cp /tmp/ssl.conf $NGINX_CONTAINER:/etc/nginx/conf.d/
}

# Reload Nginx configuration
echo -e "${YELLOW}Reloading Nginx configuration...${NC}"
docker exec $NGINX_CONTAINER nginx -t && docker exec $NGINX_CONTAINER nginx -s reload

# Create .htpasswd file for basic authentication (optional)
if [ ! -f "./nginx/.htpasswd" ]; then
    echo -e "${YELLOW}Creating basic authentication file...${NC}"
    mkdir -p nginx
    ADMIN_PASSWORD=$(openssl rand -base64 12)
    docker run --rm -i httpd:alpine htpasswd -nb admin "${ADMIN_PASSWORD}" > ./nginx/.htpasswd
    
    echo -e "${GREEN}Basic auth created:${NC}"
    echo -e "  Username: admin"
    echo -e "  Password: ${ADMIN_PASSWORD}"
    echo -e "${YELLOW}Please save this password in a secure location!${NC}"
fi

echo ""
echo -e "${GREEN}=== SSL Setup Complete ===${NC}"
echo ""
echo -e "${GREEN}Your services are now available at:${NC}"
echo -e "  Main App:     https://${DOMAIN}"
echo -e "  API:          https://api.${DOMAIN}"
echo -e "  MinIO:        https://minio.${DOMAIN}"
echo -e "  Grafana:      https://grafana.${DOMAIN}"
echo -e "  Prometheus:   https://prometheus.${DOMAIN}"
echo ""

# Create renewal script
cat > ./renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL Certificate renewal script for Docker Nginx
NGINX_CONTAINER=$(docker ps --format "{{.Names}}" | grep nginx | head -1)
docker stop $NGINX_CONTAINER
certbot renew --quiet
docker start $NGINX_CONTAINER
docker exec $NGINX_CONTAINER nginx -s reload
EOF

chmod +x ./renew-ssl.sh

echo -e "${GREEN}Renewal script created at: ./renew-ssl.sh${NC}"
echo -e "${YELLOW}Add to crontab for automatic renewal:${NC}"
echo "0 3 * * * $(pwd)/renew-ssl.sh"
echo ""
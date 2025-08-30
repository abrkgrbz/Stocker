#!/bin/bash

# SSL Certificate initialization script for Stocker
# This script will request SSL certificates from Let's Encrypt using Certbot

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
    "mail.stoocker.app"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Stocker SSL Certificate Initialization ===${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p ./certbot/conf
mkdir -p ./certbot/www
mkdir -p ./nginx/certs

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
if [ -d "./certbot/conf/live/${DOMAIN}" ]; then
    echo -e "${YELLOW}Existing certificates found for ${DOMAIN}${NC}"
    read -p "Do you want to renew/overwrite existing certificates? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}Keeping existing certificates${NC}"
        exit 0
    fi
fi

# Start nginx with temporary self-signed certificate for initial setup
echo -e "${YELLOW}Creating temporary self-signed certificate...${NC}"
openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout ./nginx/certs/temp.key \
    -out ./nginx/certs/temp.crt \
    -days 1 \
    -subj "/C=US/ST=State/L=City/O=Stocker/CN=${DOMAIN}"

# Create temporary nginx configuration for cert validation
cat > ./nginx/conf.d/00-certbot-temp.conf <<EOF
server {
    listen 80;
    server_name ${DOMAIN} ${SUBDOMAINS[@]};
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 404;
    }
}
EOF

# Start nginx container
echo -e "${YELLOW}Starting nginx for domain validation...${NC}"
docker-compose -f docker-compose.nginx.yml up -d nginx

# Wait for nginx to be ready
echo -e "${YELLOW}Waiting for nginx to be ready...${NC}"
sleep 5

# Request certificate from Let's Encrypt
echo -e "${YELLOW}Requesting SSL certificate from Let's Encrypt...${NC}"
docker run -it --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    --network stocker-network \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    ${STAGING_FLAG} \
    ${DOMAIN_ARGS}

# Check if certificate was obtained successfully
if [ ! -d "./certbot/conf/live/${DOMAIN}" ]; then
    echo -e "${RED}Failed to obtain certificate${NC}"
    exit 1
fi

echo -e "${GREEN}SSL certificate obtained successfully!${NC}"

# Remove temporary configuration
rm -f ./nginx/conf.d/00-certbot-temp.conf
rm -f ./nginx/certs/temp.key
rm -f ./nginx/certs/temp.crt

# Create .htpasswd file for basic authentication
echo -e "${YELLOW}Creating basic authentication file...${NC}"
ADMIN_PASSWORD=$(openssl rand -base64 12)
docker run --rm -i httpd:alpine htpasswd -nb admin "${ADMIN_PASSWORD}" > ./nginx/.htpasswd

echo -e "${GREEN}Basic auth created:${NC}"
echo -e "  Username: admin"
echo -e "  Password: ${ADMIN_PASSWORD}"
echo -e "${YELLOW}Please save this password in a secure location!${NC}"

# Restart nginx with new configuration
echo -e "${YELLOW}Restarting nginx with SSL configuration...${NC}"
docker-compose -f docker-compose.nginx.yml restart nginx

echo ""
echo -e "${GREEN}=== SSL Setup Complete ===${NC}"
echo ""
echo -e "${GREEN}Your services are now available at:${NC}"
echo -e "  Main App:     https://${DOMAIN}"
echo -e "  API:          https://api.${DOMAIN}"
echo -e "  MinIO:        https://minio.${DOMAIN}"
echo -e "  S3 API:       https://s3.${DOMAIN}"
echo -e "  Grafana:      https://grafana.${DOMAIN}"
echo -e "  Prometheus:   https://prometheus.${DOMAIN} (auth required)"
echo -e "  AlertManager: https://alerts.${DOMAIN} (auth required)"
echo -e "  RabbitMQ:     https://rabbitmq.${DOMAIN}"
echo -e "  Kibana:       https://kibana.${DOMAIN}"
echo -e "  Seq:          https://seq.${DOMAIN}"
echo -e "  Mailhog:      https://mail.${DOMAIN} (auth required)"
echo ""
echo -e "${YELLOW}Note: Certificate will auto-renew every 12 hours via the certbot container${NC}"
echo ""

# Create renewal script
cat > ./scripts/renew-ssl.sh <<'EOF'
#!/bin/bash
# SSL Certificate renewal script
docker-compose -f docker-compose.nginx.yml exec certbot certbot renew --quiet
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload
EOF

chmod +x ./scripts/renew-ssl.sh

echo -e "${GREEN}Renewal script created at: ./scripts/renew-ssl.sh${NC}"
echo -e "${YELLOW}You can also manually renew by running: ./scripts/renew-ssl.sh${NC}"
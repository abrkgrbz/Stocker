#!/bin/bash

# SSL Certificate initialization script for Stocker in Coolify
# This script helps prepare SSL configuration for Coolify deployments
# Coolify uses Traefik with automatic Let's Encrypt certificates

set -e

# Configuration
DOMAIN="stoocker.app"
EMAIL="admin@stoocker.app"

# Subdomains to configure
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

echo -e "${GREEN}=== Stocker SSL Configuration for Coolify ===${NC}"
echo ""

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p ./nginx

# Generate basic authentication if needed
if [ ! -f "./nginx/.htpasswd" ]; then
    echo -e "${YELLOW}Creating basic authentication file...${NC}"
    ADMIN_PASSWORD=$(openssl rand -base64 12)
    
    # Use docker to generate htpasswd
    docker run --rm -i httpd:alpine htpasswd -nb admin "${ADMIN_PASSWORD}" > ./nginx/.htpasswd
    
    echo -e "${GREEN}Basic auth created:${NC}"
    echo -e "  Username: admin"
    echo -e "  Password: ${ADMIN_PASSWORD}"
    echo -e "${YELLOW}Please save this password in a secure location!${NC}"
else
    echo -e "${GREEN}Basic auth file already exists${NC}"
fi

echo ""
echo -e "${GREEN}=== SSL Configuration Information ===${NC}"
echo ""
echo -e "${YELLOW}Coolify handles SSL certificates automatically using Traefik.${NC}"
echo ""
echo -e "${GREEN}Your services will be available at:${NC}"
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
echo -e "${YELLOW}Important Notes:${NC}"
echo -e "1. Make sure your DNS A records point to your Coolify server IP"
echo -e "2. Coolify's Traefik will automatically request Let's Encrypt certificates"
echo -e "3. Certificates will auto-renew through Traefik"
echo -e "4. No manual certificate management is needed in Coolify"
echo ""
echo -e "${GREEN}DNS Configuration Required:${NC}"
echo -e "Add these A records to your DNS provider:"
echo ""
echo -e "  ${DOMAIN}              -> Your Server IP"
for subdomain in "${SUBDOMAINS[@]}"; do
    # Extract just the subdomain part
    sub_only=${subdomain%%.*}
    echo -e "  ${subdomain}  -> Your Server IP"
done
echo ""
echo -e "${GREEN}Done!${NC}"
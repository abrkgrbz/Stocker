#!/bin/bash

# DNS checker script for SSL setup
# Checks which domains point to this server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== DNS Configuration Checker ===${NC}"
echo ""

# Get server's public IP
echo -e "${YELLOW}Getting server IP address...${NC}"
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || curl -s ipinfo.io/ip)
echo -e "${GREEN}Server IP: $SERVER_IP${NC}"
echo ""

# Domains to check
DOMAINS=(
    "stoocker.app"
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

echo -e "${YELLOW}Checking DNS records...${NC}"
echo ""

VALID_DOMAINS=()
INVALID_DOMAINS=()
EXTERNAL_DOMAINS=()

for domain in "${DOMAINS[@]}"; do
    # Get domain IP
    DOMAIN_IP=$(dig +short $domain | tail -1)
    
    if [ -z "$DOMAIN_IP" ]; then
        echo -e "${RED}✗ $domain - No DNS record found${NC}"
        INVALID_DOMAINS+=("$domain")
    elif [ "$DOMAIN_IP" == "$SERVER_IP" ]; then
        echo -e "${GREEN}✓ $domain → $DOMAIN_IP (This server)${NC}"
        VALID_DOMAINS+=("$domain")
    else
        echo -e "${YELLOW}⚠ $domain → $DOMAIN_IP (External service)${NC}"
        EXTERNAL_DOMAINS+=("$domain")
    fi
done

echo ""
echo -e "${BLUE}=== Summary ===${NC}"
echo ""

if [ ${#VALID_DOMAINS[@]} -gt 0 ]; then
    echo -e "${GREEN}Domains pointing to this server (can get SSL):${NC}"
    for domain in "${VALID_DOMAINS[@]}"; do
        echo "  • $domain"
    done
    echo ""
fi

if [ ${#EXTERNAL_DOMAINS[@]} -gt 0 ]; then
    echo -e "${YELLOW}Domains pointing to external services (skip SSL):${NC}"
    for domain in "${EXTERNAL_DOMAINS[@]}"; do
        echo "  • $domain"
    done
    echo ""
fi

if [ ${#INVALID_DOMAINS[@]} -gt 0 ]; then
    echo -e "${RED}Domains without DNS records (need configuration):${NC}"
    for domain in "${INVALID_DOMAINS[@]}"; do
        echo "  • $domain"
    done
    echo ""
fi

echo -e "${BLUE}SSL Certificate Command:${NC}"
echo ""
if [ ${#VALID_DOMAINS[@]} -gt 0 ]; then
    echo "You can get SSL certificate for these domains:"
    echo ""
    echo -n "certbot certonly --standalone"
    for domain in "${VALID_DOMAINS[@]}"; do
        echo -n " -d $domain"
    done
    echo " --email admin@stoocker.app --agree-tos"
else
    echo -e "${RED}No valid domains found pointing to this server!${NC}"
    echo "Please configure DNS records first."
fi
echo ""

echo -e "${YELLOW}Note:${NC} Make sure port 80 is available before running certbot"
echo "Stop Traefik if needed: docker stop coolify-proxy"
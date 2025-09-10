#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Stocker deployment...${NC}"

# Stop Coolify web container if exists
echo -e "${YELLOW}Stopping Coolify web container if exists...${NC}"
docker stop $(docker ps -q --filter "name=web-t0kogcgc") 2>/dev/null || true

# Create network if not exists
echo -e "${YELLOW}Creating Docker network...${NC}"
docker network create web 2>/dev/null || true

# Navigate to deployment directory
cd /opt/stocker

# Copy configuration files
echo -e "${YELLOW}Setting up configuration files...${NC}"
cat > traefik.yml << 'EOF'
api:
  dashboard: true
  debug: false

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    exposedByDefault: false
    network: web
  file:
    directory: /config
    watch: true

certificatesResolvers:
  cloudflare:
    acme:
      email: anilberk199751@gmail.com
      storage: /certs/acme.json
      dnsChallenge:
        provider: cloudflare
        resolvers:
          - "1.1.1.1:53"
          - "8.8.8.8:53"

log:
  level: INFO

accessLog: {}
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

networks:
  web:
    external: true

services:
  traefik:
    image: traefik:v3.1
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    networks:
      - web
    ports:
      - 80:80
      - 443:443
      - 8080:8080
    environment:
      - CLOUDFLARE_EMAIL=anilberk199751@gmail.com
      - CLOUDFLARE_API_KEY=295600b8132d530e289d11cef34dd1d1ed8a7
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/traefik.yml:ro
      - ./traefik/certs:/certs
      - ./traefik/config:/config
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.stoocker.app\`)"
      - "traefik.http.routers.traefik.tls=true"
      - "traefik.http.routers.traefik.tls.certresolver=cloudflare"
      - "traefik.http.routers.traefik.service=api@internal"

  web:
    build:
      context: https://github.com/abrkgrbz/Stocker.git#master
      dockerfile: stocker-web/Dockerfile
    container_name: stocker-web
    restart: unless-stopped
    networks:
      - web
    environment:
      - VITE_API_URL=https://api.stoocker.app
      - VITE_APP_URL=https://stoocker.app
      - VITE_MOCK_ENABLED=false
    labels:
      - "traefik.enable=true"
      # Ana domain
      - "traefik.http.routers.web.entrypoints=websecure"
      - "traefik.http.routers.web.rule=Host(\`stoocker.app\`) || Host(\`www.stoocker.app\`)"
      - "traefik.http.routers.web.tls=true"
      - "traefik.http.routers.web.tls.certresolver=cloudflare"
      - "traefik.http.routers.web.priority=10"
      # Wildcard routing
      - "traefik.http.routers.web-wildcard.entrypoints=websecure"
      - "traefik.http.routers.web-wildcard.rule=HostRegexp(\`{subdomain:[a-z0-9-]+}.stoocker.app\`)"
      - "traefik.http.routers.web-wildcard.tls=true"
      - "traefik.http.routers.web-wildcard.tls.certresolver=cloudflare"
      - "traefik.http.routers.web-wildcard.tls.domains[0].main=stoocker.app"
      - "traefik.http.routers.web-wildcard.tls.domains[0].sans=*.stoocker.app"
      - "traefik.http.routers.web-wildcard.priority=5"
      # Service
      - "traefik.http.services.web.loadbalancer.server.port=80"
EOF

# Set proper permissions
touch traefik/certs/acme.json
chmod 600 traefik/certs/acme.json

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker compose up -d --build

# Wait for services
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check status
echo -e "${GREEN}Checking service status:${NC}"
docker compose ps

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Access your application at: https://stoocker.app${NC}"
echo -e "${GREEN}Traefik dashboard at: https://traefik.stoocker.app${NC}"
echo -e "${GREEN}Test wildcard domain: https://demo.stoocker.app${NC}"
EOF

chmod +x build-and-deploy.sh
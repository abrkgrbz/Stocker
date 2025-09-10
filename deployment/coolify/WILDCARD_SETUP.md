# Wildcard Domain Setup for Coolify

## Option 1: CloudFlare (RECOMMENDED)

### Step 1: Move DNS to CloudFlare
1. Create free CloudFlare account
2. Add your domain (stoocker.app)
3. Change nameservers at Namecheap to CloudFlare's nameservers
4. Add DNS records in CloudFlare:
   ```
   A    @              95.217.219.4
   A    *              95.217.219.4
   CNAME api           stoocker.app
   CNAME admin         stoocker.app
   CNAME minio         stoocker.app
   CNAME seq           stoocker.app
   ```

### Step 2: Get CloudFlare API Token
1. Go to CloudFlare → My Profile → API Tokens
2. Create Token → Edit zone DNS template
3. Permissions:
   - Zone → DNS → Edit
   - Zone → Zone → Read
4. Zone Resources: Include → Specific zone → stoocker.app
5. Copy the token

### Step 3: Configure Coolify Proxy
SSH to server and update Coolify proxy:

```bash
# Stop current proxy
docker stop coolify-proxy

# Create new docker-compose for proxy
cat > /data/coolify/proxy/docker-compose.yml << 'EOF'
version: '3.8'
services:
  traefik:
    container_name: coolify-proxy
    image: traefik:v3.0
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - coolify
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /data/coolify/proxy/traefik.yaml:/etc/traefik/traefik.yaml:ro
      - /data/coolify/proxy/dynamic:/etc/traefik/dynamic:ro
      - /data/coolify/proxy/acme.json:/acme.json
    environment:
      - CF_DNS_API_TOKEN=YOUR_CLOUDFLARE_TOKEN_HERE
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.file.directory=/etc/traefik/dynamic"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.cloudflare.acme.dnschallenge=true"
      - "--certificatesresolvers.cloudflare.acme.dnschallenge.provider=cloudflare"
      - "--certificatesresolvers.cloudflare.acme.email=info@stoocker.app"
      - "--certificatesresolvers.cloudflare.acme.storage=/acme.json"
      
networks:
  coolify:
    external: true
EOF

# Start new proxy
cd /data/coolify/proxy
docker-compose up -d
```

### Step 4: Update Application in Coolify
In Coolify UI for your web application:
1. Go to Settings → Domains
2. Add these domains:
   - `stoocker.app`
   - `*.stoocker.app`
3. In Environment Variables, add:
   ```
   TRAEFIK_LABELS=traefik.http.routers.web.tls.certresolver=cloudflare;traefik.http.routers.web.tls.domains[0].main=stoocker.app;traefik.http.routers.web.tls.domains[0].sans=*.stoocker.app
   ```

## Option 2: Manual Subdomain Management (Current Setup)

If you want to keep Namecheap:

### For Each New Tenant:
1. In Coolify UI → Applications → Web
2. Settings → Domains
3. Add the tenant subdomain manually:
   - `demo.stoocker.app`
   - `techstart.stoocker.app`
   - etc.

### Automation Script for Manual Method:
Create this script on your server:

```bash
#!/bin/bash
# /usr/local/bin/add-tenant-domain.sh

TENANT_SLUG=$1
COOLIFY_APP_ID="YOUR_APP_UUID" # Get from Coolify URL

if [ -z "$TENANT_SLUG" ]; then
    echo "Usage: $0 <tenant-slug>"
    exit 1
fi

# Add domain via Coolify API (if available)
# Or restart container with new labels
docker exec coolify-proxy sh -c "
cat >> /etc/traefik/dynamic/tenant-$TENANT_SLUG.yaml << EOF
http:
  routers:
    tenant-$TENANT_SLUG:
      rule: 'Host(\`$TENANT_SLUG.stoocker.app\`)'
      entryPoints:
        - websecure
      service: web-service
      tls:
        certResolver: letsencrypt
EOF
"

echo "Added domain: $TENANT_SLUG.stoocker.app"
```

## Option 3: Path-Based Routing (No Wildcard Needed)

Change architecture to use paths instead of subdomains:

```typescript
// In frontend tenant.ts
export function getTenantUrl(slug: string): string {
  return `https://stoocker.app/t/${slug}`;
}
```

This avoids wildcard certificates entirely.

## Recommendation

**Use Option 1 (CloudFlare)** because:
- Free wildcard SSL certificates
- Automatic SSL for all subdomains
- Better DDoS protection
- Free CDN
- No manual domain addition for each tenant

Would you like help implementing any of these options?
# Coolify Wildcard Subdomain Setup Guide

## Step 1: Update Traefik Configuration in Coolify UI

Go to: **Servers → Your Server → Proxy → Traefik Configuration**

Replace the configuration with this:

```yaml
version: '3.8'
services:
  traefik:
    container_name: coolify-proxy
    image: traefik:v3.1
    restart: unless-stopped
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    networks:
      - coolify
    ports:
      - '80:80'
      - '443:443'
      - '443:443/udp'
      - '8080:8080'
    healthcheck:
      test: 'wget -qO- http://localhost:80/ping || exit 1'
      interval: 4s
      timeout: 2s
      retries: 5
    volumes:
      - '/var/run/docker.sock:/var/run/docker.sock:ro'
      - '/data/coolify/proxy/:/traefik'
    environment:
      - CLOUDFLARE_EMAIL=info@stoocker.app
      - CLOUDFLARE_API_KEY=YOUR_CLOUDFLARE_GLOBAL_API_KEY
    command:
      - '--ping=true'
      - '--ping.entrypoint=http'
      - '--api.dashboard=true'
      - '--api.insecure=true'
      - '--entrypoints.http.address=:80'
      - '--entrypoints.https.address=:443'
      - '--entrypoints.http.http.encodequerysemicolons=true'
      - '--entrypoints.https.http.encodequerysemicolons=true'
      - '--entrypoints.https.http3'
      - '--entrypoints.https.http3.advertisedport=443'
      - '--entrypoints.http.http.redirections.entrypoint.to=https'
      - '--entrypoints.http.http.redirections.entrypoint.scheme=https'
      - '--entrypoints.http.http.redirections.entrypoint.permanent=true'
      - '--providers.docker=true'
      - '--providers.docker.exposedbydefault=false'
      - '--providers.docker.useBindPortIP=true'
      - '--providers.docker.allowEmptyServices=true'
      - '--providers.docker.network=coolify'
      - '--providers.file.directory=/traefik/dynamic'
      - '--providers.file.watch=true'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge=true'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=http'
      - '--certificatesresolvers.letsencrypt.acme.email=info@stoocker.app'
      - '--certificatesresolvers.letsencrypt.acme.storage=/traefik/acme.json'
      - '--certificatesresolvers.letsencrypt.acme.dnschallenge=true'
      - '--certificatesresolvers.letsencrypt.acme.dnschallenge.provider=cloudflare'
      - '--certificatesresolvers.letsencrypt.acme.dnschallenge.delaybeforecheck=0'
      - '--log.level=ERROR'
      - '--log.format=common'
      - '--accesslog=false'
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.traefik.entrypoints=http'
      - 'traefik.http.routers.traefik.service=api@internal'
      - 'traefik.http.routers.traefik.tls.domains[0].main=stoocker.app'
      - 'traefik.http.routers.traefik.tls.domains[0].sans=*.stoocker.app'
      - 'traefik.http.services.traefik.loadbalancer.server.port=8080'
```

## Step 2: Get CloudFlare Global API Key

1. Go to CloudFlare → My Profile → API Tokens
2. View **Global API Key** (NOT API Token)
3. Replace `YOUR_CLOUDFLARE_GLOBAL_API_KEY` in the config above

## Step 3: Update Your Application's Docker Compose

In Coolify, go to your Web application and add these environment variables:

```
TRAEFIK_LABELS=traefik.http.routers.web-wildcard.rule=HostRegexp(`^.+\.stoocker\.app$`);traefik.http.routers.web-wildcard.priority=0;traefik.http.routers.web-wildcard.entryPoints=https;traefik.http.routers.web-wildcard.tls=true;traefik.http.routers.web-wildcard.tls.certresolver=letsencrypt
```

Or in the Advanced tab, add these labels:

```yaml
labels:
  - traefik.http.routers.web-wildcard.rule=HostRegexp(`^.+\.stoocker\.app$$`)
  - traefik.http.routers.web-wildcard.priority=0
  - traefik.http.routers.web-wildcard.entryPoints=https
  - traefik.http.routers.web-wildcard.tls=true
  - traefik.http.routers.web-wildcard.tls.certresolver=letsencrypt
```

## Step 4: CloudFlare DNS Setup

Make sure you have these DNS records in CloudFlare:

```
Type: A    Name: @              Content: 95.217.219.4    Proxy: ON
Type: A    Name: *              Content: 95.217.219.4    Proxy: OFF (DNS only)
```

**IMPORTANT**: The wildcard record (*) must be set to **DNS only** (gray cloud), not Proxied!

## Step 5: Deploy

1. Save the Traefik configuration
2. Restart the proxy
3. Redeploy your web application
4. Wait 1-2 minutes for SSL certificates

## Testing

After deployment, all subdomains should work automatically:
- https://demo.stoocker.app
- https://techstart.stoocker.app
- https://anynewsubdomain.stoocker.app

## Notes

- You don't need to add each subdomain manually anymore
- The wildcard certificate covers all subdomains
- New tenants will automatically work with their subdomains
- Make sure CloudFlare wildcard (*) record is set to DNS only (not proxied)
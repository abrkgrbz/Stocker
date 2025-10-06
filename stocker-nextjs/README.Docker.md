# Docker Deployment Guide - Stocker Auth

## Overview
This Next.js application handles authentication and registration for the Stocker platform on the `auth.stoocker.app` subdomain.

## Files Structure
```
stocker-nextjs/
├── Dockerfile                  # Multi-stage Docker build
├── .dockerignore              # Files to exclude from Docker context
├── .env.production            # Production environment variables
└── src/app/api/health/        # Health check endpoint
```

## Deployment Files
```
deployment/coolify/applications/
└── 03-auth-nextjs.yml         # Coolify/Docker Compose configuration
```

## Build & Deploy

### Local Build (Testing)
```bash
# Build the image
docker build -f stocker-nextjs/Dockerfile -t stocker-auth:latest .

# Run locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.stoocker.app \
  -e NEXT_PUBLIC_APP_URL=https://auth.stoocker.app \
  stocker-auth:latest

# Test health check
curl http://localhost:3000/api/health
```

### Production Deployment (Coolify)

1. **Push to Repository**
   ```bash
   git add .
   git commit -m "feat: Add Docker deployment for auth app"
   git push origin main
   ```

2. **Configure in Coolify**
   - Create new application
   - Select repository and branch
   - Set build path: `deployment/coolify/applications/03-auth-nextjs.yml`
   - Leave FQDN empty (Traefik handles routing)
   - Deploy

3. **Verify Deployment**
   ```bash
   # Check health
   curl https://auth.stoocker.app/api/health

   # Check registration page
   curl https://auth.stoocker.app/register
   ```

## Configuration

### Environment Variables
Set in Coolify or docker-compose:

- `NEXT_PUBLIC_API_URL` - Backend API URL (https://api.stoocker.app)
- `NEXT_PUBLIC_APP_URL` - This app's URL (https://auth.stoocker.app)
- `NEXT_PUBLIC_MAIN_APP_URL` - Main app URL (https://stoocker.app)
- `NODE_ENV` - Always `production`
- `NEXT_TELEMETRY_DISABLED` - Disable Next.js telemetry

### Traefik Routing
The application is configured with:
- **Host**: `auth.stoocker.app`
- **Priority**: 15 (higher than wildcard routes)
- **SSL**: Automatic via Cloudflare resolver
- **HTTP→HTTPS**: Automatic redirect

### Health Check
- **Endpoint**: `/api/health`
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3
- **Start Period**: 40s

## Next.js Configuration

### Standalone Output
Configured in `next.config.ts`:
```typescript
{
  output: 'standalone'
}
```

This creates an optimized production build with minimal dependencies.

### Image Optimization
Configured remote patterns for:
- Localhost development
- Production API uploads

## Docker Build Stages

1. **base** - Node 20 Alpine base image
2. **deps** - Install production dependencies
3. **builder** - Build Next.js application
4. **runner** - Minimal production runtime

### Optimizations
- Multi-stage build reduces final image size
- npm ci for reproducible builds
- Standalone output minimizes dependencies
- Non-root user (nextjs:nodejs) for security
- Alpine Linux for minimal footprint

## Troubleshooting

### Build Issues
```bash
# Clean build
docker build --no-cache -f stocker-nextjs/Dockerfile -t stocker-auth:latest .

# Check build logs
docker logs stocker-auth
```

### Container Issues
```bash
# Check container status
docker ps -a | grep stocker-auth

# View logs
docker logs -f stocker-auth

# Inspect health
docker inspect stocker-auth | grep -A 10 Health
```

### Next.js Issues
```bash
# Rebuild with verbose output
docker build --progress=plain -f stocker-nextjs/Dockerfile .
```

## Security

- Non-root user execution
- Security headers configured
- HTTPS only via Traefik
- No port exposure (Traefik proxy only)
- Minimal attack surface with Alpine Linux

## Performance

- Standalone output reduces cold start time
- Optimized image size (~150MB)
- Health checks ensure availability
- Restart policy: `unless-stopped`

## Monitoring

Health check returns:
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T10:30:00.000Z",
  "service": "stocker-auth"
}
```

Monitor at: `https://auth.stoocker.app/api/health`

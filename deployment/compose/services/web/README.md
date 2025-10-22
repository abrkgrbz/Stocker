# Stocker Web Service (Next.js)

Frontend web application built with Next.js 15, React 19, and Ant Design.

## 📋 Overview

- **Framework**: Next.js 15.5.4 (App Router)
- **UI Library**: Ant Design 5.27
- **State Management**: Zustand + TanStack Query
- **Authentication**: Custom JWT + HMAC
- **Multi-tenant**: Subdomain-based tenant detection
- **i18n**: i18next for internationalization

## 🚀 Quick Start

### 1. Environment Setup

Copy the example environment file and update with production values:

```bash
cd deployment/compose/services/web
cp .env.example .env
```

### 2. Generate Secure Secrets

```bash
# Generate HMAC Secret (required)
openssl rand -base64 48

# Generate JWT Secret (if using custom JWT)
openssl rand -base64 48

# Generate NextAuth Secret (if using NextAuth)
openssl rand -base64 48
```

### 3. Update .env File

Edit `.env` and update these critical variables:

```env
# REQUIRED - Update these secrets
HMAC_SECRET=<paste generated secret here>
JWT_SECRET=<paste generated secret here>
NEXTAUTH_SECRET=<paste generated secret here>

# REQUIRED - Verify domains are correct
NEXT_PUBLIC_BASE_DOMAIN=stoocker.app
NEXT_PUBLIC_AUTH_DOMAIN=https://auth.stoocker.app
NEXT_PUBLIC_API_URL=https://api.stoocker.app
API_INTERNAL_URL=http://api:5000

# OPTIONAL - Update if using email features
SMTP_HOST=mail.privateemail.com
SMTP_USER=info@stoocker.app
SMTP_PASSWORD=<your email password>
```

### 4. Deploy with Coolify

#### Option A: Using Coolify UI

1. Go to Coolify Dashboard → Your Project → Web Service
2. Navigate to **Environment Variables** tab
3. Add all variables from `.env` file
4. **Important**: Add these as **build args** too:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_BASE_DOMAIN`
   - `NEXT_PUBLIC_AUTH_DOMAIN`
5. Click **Deploy** or **Redeploy**

#### Option B: Using Docker Compose

```bash
# Build and start the service
cd deployment/compose/services/web
docker compose up -d --build

# View logs
docker compose logs -f web

# Stop the service
docker compose down
```

## 🔒 Security Configuration

### Required Environment Variables

These variables are **REQUIRED** for production build:

| Variable | Description | Example |
|----------|-------------|---------|
| `HMAC_SECRET` | HMAC signature secret (min 32 chars) | Generated with openssl |
| `NEXT_PUBLIC_BASE_DOMAIN` | Base domain for multi-tenant | `stoocker.app` |
| `NEXT_PUBLIC_AUTH_DOMAIN` | Auth service URL | `https://auth.stoocker.app` |
| `API_INTERNAL_URL` | Internal API endpoint | `http://api:5000` |
| `NODE_ENV` | Node environment | `production` |

### SSL/TLS Configuration

SSL certificates are managed by Traefik with Cloudflare DNS challenge:

```yaml
# docker-compose.yml
- "traefik.http.routers.web-main-secure.tls=true"
- "traefik.http.routers.web-main-secure.tls.certresolver=cloudflare"
- "traefik.http.routers.web-main-secure.tls.domains[0].main=stoocker.app"
- "traefik.http.routers.web-main-secure.tls.domains[0].sans=*.stoocker.app"
```

## 🌐 Domain Configuration

### Main Domain

- **Production**: https://stoocker.app
- **WWW Redirect**: https://www.stoocker.app → https://stoocker.app

### Multi-tenant Subdomains

Each tenant gets their own subdomain:

- https://demo.stoocker.app
- https://company1.stoocker.app
- https://company2.stoocker.app

Tenant detection is handled automatically via:
1. Traefik extracts subdomain from hostname
2. Custom middleware adds `X-Tenant-Slug` header
3. Next.js middleware validates and processes tenant

## 🏗️ Architecture

### Build Process

```
1. Builder Stage (Multi-stage Dockerfile)
   ├─ Install dependencies (npm ci)
   ├─ Copy source files
   ├─ Pass NEXT_PUBLIC_* build args
   └─ Build Next.js app (npm run build)

2. Runner Stage
   ├─ Copy standalone build
   ├─ Copy static assets
   ├─ Set up non-root user
   └─ Run with node server.js
```

### Directory Structure

```
stocker-nextjs/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Auth pages (login, register)
│   │   ├── (dashboard)/  # Dashboard pages (protected)
│   │   └── api/          # API routes
│   ├── components/       # Reusable components
│   ├── features/         # Feature-based modules
│   ├── lib/              # Utilities and configs
│   │   ├── api/          # API client
│   │   ├── auth/         # Authentication logic
│   │   ├── env.ts        # Environment validation
│   │   └── tenant/       # Multi-tenant logic
│   └── hooks/            # Custom React hooks
├── public/               # Static assets
├── Dockerfile            # Production build
└── next.config.ts        # Next.js configuration
```

## 🔄 Environment Variable Validation

The app validates environment variables at build time using Zod schemas:

```typescript
// Production schema (strict)
const prodEnvSchema = z.object({
  NODE_ENV: z.literal('production'),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_BASE_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_AUTH_DOMAIN: z.string().url(),
  API_INTERNAL_URL: z.string().url(),
  HMAC_SECRET: z.string().min(32),
  // ... other variables
})
```

If any required variable is missing, the build will fail with clear error message.

## 📊 Health Checks

### Docker Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Monitoring URLs

- **Application**: https://stoocker.app
- **API Backend**: https://api.stoocker.app
- **Auth Service**: https://auth.stoocker.app

## 🐛 Troubleshooting

### Build Fails - Missing Environment Variables

**Error**: `❌ Production build failed - Missing required environment variables: ...`

**Solution**:
1. Check `.env` file exists in `deployment/compose/services/web/`
2. Verify all required variables are set
3. In Coolify, add variables to **both** Environment Variables AND Build Args

### Build Fails - Cannot Find package.json

**Error**: `npm error Missing script: "build"`

**Solution**: Verify `docker-compose.yml` has correct build context:

```yaml
build:
  context: stocker-nextjs  # Should be project directory
  dockerfile: Dockerfile   # Relative to context
```

### Port Conflict

**Error**: `bind: address already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Container Keeps Restarting

**Solution**:
```bash
# Check container logs
docker logs stocker-web

# Check if all services are running
docker ps -a

# Verify network connectivity
docker exec stocker-web curl http://api:5000/health
```

## 🔗 Related Services

- **API Service**: [deployment/compose/services/api/](../api/)
- **Auth Service**: [deployment/compose/services/auth/](../auth/)
- **MinIO Storage**: [deployment/compose/infrastructure/minio/](../../infrastructure/minio/)
- **Redis Cache**: [deployment/compose/infrastructure/redis/](../../infrastructure/redis/)

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Ant Design Components](https://ant.design/components/overview/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)

## 🆘 Support

For issues and questions:
1. Check logs: `docker compose logs -f web`
2. Review environment variables in Coolify UI
3. Verify network connectivity between services
4. Check Traefik routing configuration

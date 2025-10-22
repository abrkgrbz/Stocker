# Stocker Auth Service (Next.js)

Authentication and landing page service for Stocker ERP. Handles user authentication, registration, and serves as the entry point for the application.

## 📋 Overview

- **Framework**: Next.js 15.5.4 (App Router)
- **Purpose**: Authentication, Authorization, Landing Page
- **Domains Served**:
  - `stoocker.app` (landing page)
  - `auth.stoocker.app` (authentication pages)
  - `*.stoocker.app` (multi-tenant routing)
- **UI Library**: Ant Design 5.27
- **Authentication**: NextAuth.js + Custom JWT + HMAC

## 🌐 Domain Routing

### Priority-based Routing (Traefik)

```yaml
Priority 20: stoocker.app, www.stoocker.app     → Auth Service (Landing Page)
Priority 15: auth.stoocker.app                  → Auth Service (Auth Pages)
Priority 10: *.stoocker.app                     → Auth Service → Tenant App
```

### Routes Handled

1. **Landing Page** (`stoocker.app`):
   - `/` - Home page
   - `/features` - Features page
   - `/pricing` - Pricing page
   - `/contact` - Contact page

2. **Authentication** (`auth.stoocker.app`):
   - `/login` - User login
   - `/register` - User registration
   - `/forgot-password` - Password recovery
   - `/reset-password` - Password reset
   - `/verify-email` - Email verification
   - `/2fa` - Two-factor authentication

3. **Multi-tenant** (`{tenant}.stoocker.app`):
   - Detects tenant from subdomain
   - Redirects to appropriate tenant application

## 🚀 Quick Start

### 1. Environment Setup

Copy the example environment file:

```bash
cd deployment/compose/services/auth
cp .env.example .env
```

### 2. Generate Secure Secrets

**IMPORTANT**: Auth and Web services must share the same secrets for cross-service authentication.

```bash
# Generate HMAC Secret (MUST BE SAME as web service)
openssl rand -base64 48

# Generate JWT Secret (MUST BE SAME as web service)
openssl rand -base64 48

# Generate NextAuth Secret
openssl rand -base64 48

# Generate Session Secret
openssl rand -base64 48
```

### 3. Update .env File

Edit `.env` and update these critical variables:

```env
# REQUIRED - Update these secrets (MUST MATCH web service)
HMAC_SECRET=<same secret as web service>
JWT_SECRET=<same secret as web service>
NEXTAUTH_SECRET=<paste generated secret here>
SESSION_SECRET=<paste generated secret here>

# REQUIRED - Verify domains are correct
NEXT_PUBLIC_APP_URL=https://auth.stoocker.app
NEXT_PUBLIC_MAIN_APP_URL=https://stoocker.app
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

1. Go to Coolify Dashboard → Your Project → Auth Service
2. Navigate to **Environment Variables** tab
3. Add all variables from `.env` file
4. **Important**: Add these as **build args** too:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_MAIN_APP_URL`
5. Click **Deploy** or **Redeploy**

#### Option B: Using Docker Compose

```bash
# Build and start the service
cd deployment/compose/services/auth
docker compose up -d --build

# View logs
docker compose logs -f auth

# Stop the service
docker compose down
```

## 🔒 Security Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `HMAC_SECRET` | HMAC signature secret (min 32 chars) | Generated with openssl |
| `JWT_SECRET` | JWT token secret (min 32 chars) | Generated with openssl |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | Generated with openssl |
| `SESSION_SECRET` | Session encryption secret | Generated with openssl |
| `NEXT_PUBLIC_BASE_DOMAIN` | Base domain for multi-tenant | `stoocker.app` |
| `NEXT_PUBLIC_AUTH_DOMAIN` | Auth service URL | `https://auth.stoocker.app` |
| `API_INTERNAL_URL` | Internal API endpoint | `http://api:5000` |
| `NODE_ENV` | Node environment | `production` |

### Shared Secrets with Web Service

**CRITICAL**: These secrets MUST be identical in both auth and web services:

- `HMAC_SECRET` - For tenant signature validation across services
- `JWT_SECRET` - For JWT token validation across services
- `SESSION_SECRET` - For session sharing across subdomains

### Rate Limiting

Auth endpoints are protected with rate limiting:

| Endpoint | Max Attempts | Time Window |
|----------|-------------|-------------|
| Login | 5 attempts | 15 minutes |
| Registration | 3 attempts | 60 minutes |
| Password Reset | 3 attempts | 60 minutes |

## 🏗️ Architecture

### Service Responsibilities

```
┌─────────────────────────────────────────────────────────┐
│                    Traefik Proxy                         │
│  Priority-based routing with Cloudflare SSL              │
└───────────┬─────────────┬──────────────┬────────────────┘
            │             │              │
            │             │              │
   ┌────────▼────────┐   │   ┌──────────▼──────────┐
   │ stoocker.app    │   │   │ auth.stoocker.app   │
   │ Landing Page    │   │   │ Login/Register      │
   └─────────────────┘   │   └─────────────────────┘
                         │
              ┌──────────▼──────────┐
              │ {tenant}.stoocker   │
              │ Tenant Detection    │
              │ → App Routing       │
              └─────────────────────┘
```

### Build Context

Auth service uses the same Next.js codebase as web service:

```yaml
build:
  context: ./stocker-nextjs  # Relative to repository root
  dockerfile: Dockerfile
```

The difference is in environment variables:
- **Auth Service**: Serves landing + auth pages
- **Web Service**: Serves tenant dashboard app

## 🔄 Environment Variable Flow

### Build-time Variables (Build Args)

Passed during Docker build:

```yaml
args:
  NEXT_PUBLIC_API_URL: https://api.stoocker.app
  NEXT_PUBLIC_APP_URL: https://auth.stoocker.app
  NEXT_PUBLIC_MAIN_APP_URL: https://stoocker.app
```

### Runtime Variables (Environment)

Set at container runtime:

```yaml
environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_AUTH_DOMAIN=https://auth.stoocker.app
  - API_INTERNAL_URL=http://api:5000
  - HMAC_SECRET=${HMAC_SECRET}
  # ... all other secrets
```

## 📊 Health Checks

### Docker Health Check

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Health Check Endpoint

Auth service should expose `/api/health` endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    service: 'auth',
    timestamp: new Date().toISOString()
  })
}
```

### Monitoring URLs

- **Landing Page**: https://stoocker.app
- **Auth Service**: https://auth.stoocker.app
- **API Backend**: https://api.stoocker.app

## 🐛 Troubleshooting

### Build Fails - Missing Environment Variables

**Error**: `❌ Production build failed - Missing required environment variables`

**Solution**:
1. Check `.env` file exists
2. Verify all required variables are set
3. In Coolify, add variables to both **Environment Variables** AND **Build Args**

### Healthcheck Failing

**Error**: Container shows as `unhealthy`

**Solution**:
1. Check if `/api/health` endpoint exists
2. Verify Next.js is running on port 3000
3. Test manually: `docker exec <container> wget -O- http://127.0.0.1:3000/api/health`

### Authentication Not Working Across Subdomains

**Error**: Users logged in on `auth.stoocker.app` not authenticated on `demo.stoocker.app`

**Solution**:
1. Verify `COOKIE_BASE_DOMAIN=stoocker.app` (no leading dot)
2. Ensure `HMAC_SECRET`, `JWT_SECRET`, `SESSION_SECRET` are SAME in auth and web services
3. Check cookies are set with `Domain=.stoocker.app`

### Redirect Loop on Login

**Error**: `/login` redirects to `/dashboard` which redirects back to `/login`

**Solution**:
1. Check `NEXT_PUBLIC_AUTH_DOMAIN` points to auth service
2. Verify `NEXT_PUBLIC_MAIN_APP_URL` points to tenant app
3. Review middleware redirect logic

## 🔗 Related Services

- **Web Service**: [deployment/compose/services/web/](../web/)
- **API Service**: [deployment/compose/services/api/](../api/)
- **Redis Cache**: [deployment/compose/infrastructure/redis/](../../infrastructure/redis/)

## 📚 Authentication Flow

### 1. User Registration

```
User → auth.stoocker.app/register
  → POST /api/auth/register
    → Validate input
    → Check email uniqueness (API call)
    → Create user (API call)
    → Send verification email
    → Redirect to /verify-email
```

### 2. User Login

```
User → auth.stoocker.app/login
  → POST /api/auth/login
    → Validate credentials (API call)
    → Generate JWT token
    → Set session cookie (Domain=.stoocker.app)
    → Redirect to tenant app (demo.stoocker.app)
```

### 3. Tenant Access

```
User → demo.stoocker.app
  → Middleware checks session cookie
  → Extract tenant from subdomain
  → Validate tenant signature (HMAC)
  → If authenticated: allow access
  → If not: redirect to auth.stoocker.app/login
```

## 🆘 Support

For issues and questions:
1. Check logs: `docker compose logs -f auth`
2. Review environment variables in Coolify UI
3. Test healthcheck: `docker exec auth wget -O- http://127.0.0.1:3000/api/health`
4. Verify Traefik routing configuration
5. Check shared secrets match with web service

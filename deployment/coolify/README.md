# Coolify Deployment

Coolify platform-specific configurations for Stocker application.

## 📁 Structure

```
coolify/
├── apps/       # Coolify application definitions
│   ├── 01-api.yml
│   ├── 02-web.yml
│   ├── 03-auth-nextjs.yml
│   ├── 04-admin.yml
│   └── infrastructure/
└── env/        # Environment variable templates
```

## 🚀 Deployment on Coolify

### Prerequisites

1. **GitHub Repository**: Code must be pushed to GitHub
2. **Coolify GitHub App**: Install Coolify GitHub app and authorize repository access
3. **Domain DNS**: Point domains to Coolify server (DNS only, no proxy)

### 1. Deploy from GitHub

In Coolify dashboard:

#### Option A: GitHub Integration (Recommended)
1. Go to **Projects** → **New Resource** → **GitHub App**
2. Select your repository: `your-org/Stocker`
3. Choose deployment type: **Docker Compose**
4. Set compose file path: `deployment/coolify/apps/01-api.yml` (for API)
5. Set build context: `/` (repository root)
6. Configure environment variables (see below)
7. Click **Deploy**

#### Option B: Manual Upload
1. Go to **Projects** → **New Resource** → **Docker Compose**
2. Upload YAML from `apps/` directory
3. Configure environment variables from `env/` templates

### 2. Infrastructure First

Deploy in this order:
1. Database (`apps/infrastructure/01-database.yml`)
2. Redis (`apps/infrastructure/02-redis.yml`)
3. Seq (`apps/infrastructure/03-seq.yml`)
4. MinIO (`apps/infrastructure/04-minio.yml`)

### 3. Application Services

Then deploy:
1. API (`apps/01-api.yml`)
2. Web (`apps/02-web.yml`)
3. Admin (`apps/04-admin.yml`)
4. Auth (`apps/03-auth-nextjs.yml`)

## 🔧 Environment Variables

Coolify provides environment variable management per service.

### Required Secrets

Create these in Coolify's secrets management:

- `SA_PASSWORD`: SQL Server password
- `JWT_SECRET`: JWT signing key
- `REDIS_PASSWORD`: Redis password
- `SEQ_API_KEY`: Seq logging API key
- `MINIO_ROOT_USER`: MinIO username
- `MINIO_ROOT_PASSWORD`: MinIO password
- `SMTP_USERNAME`: Email username
- `SMTP_PASSWORD`: Email password
- `NEXTAUTH_SECRET`: NextAuth secret

### Connection Strings

Coolify auto-injects these:
- `ConnectionStrings__MasterConnection`
- `ConnectionStrings__TenantConnection`
- `ConnectionStrings__HangfireConnection`

## 🌐 Domain Configuration

Configure these domains in Coolify:

- api.stoocker.app → API service
- stoocker.app → Web service
- admin.stoocker.app → Admin service
- auth.stoocker.app → Auth service
- seq.stoocker.app → Seq service
- s3.stoocker.app → MinIO service

Coolify will automatically provision Let's Encrypt SSL certificates.

## 📊 Monitoring

### Coolify Built-in

- Service logs in dashboard
- Resource usage metrics
- Health check status

### Application Monitoring

- **Seq**: https://seq.stoocker.app
- **API Health**: https://api.stoocker.app/health
- **Hangfire**: https://api.stoocker.app/hangfire

## 🔄 Updates & Rollbacks

### Update Service

In Coolify:
1. Go to service
2. Click **Redeploy**
3. Wait for deployment

### Rollback

1. Go to **Deployments** history
2. Select previous version
3. Click **Redeploy**

## 🔐 Security

Coolify provides:
- Automatic SSL/TLS
- Secret management
- Network isolation
- Automatic backups (if configured)

## 📝 Notes

- All services use Coolify's managed network
- Traefik handles routing and SSL
- Environment variables are encrypted
- Logs are retained per Coolify settings

## 🆘 Troubleshooting

### Service Won't Start

1. Check logs in Coolify dashboard
2. Verify environment variables
3. Check resource limits
4. Verify network connectivity

### Database Connection Issues

1. Verify `ConnectionStrings__*` variables
2. Check database service is running
3. Check network connectivity
4. Verify SA_PASSWORD is correct

### SSL Certificate Issues

1. Verify domain DNS points to Coolify server
2. Check Cloudflare proxy is disabled (DNS only)
3. Wait 2-3 minutes for certificate provisioning
4. Check Traefik logs

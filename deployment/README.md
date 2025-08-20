# Stocker Multi-Tenant SaaS Deployment Guide

## 🚀 Deployment Overview

Stocker is a multi-tenant SaaS application that supports wildcard subdomains for tenant isolation.

## 📋 Prerequisites

1. **Domain Configuration**
   - A domain name (e.g., stocker.app)
   - DNS access for wildcard subdomain setup
   - SSL wildcard certificate (or Let's Encrypt)

2. **Server Requirements**
   - Docker & Docker Compose
   - Minimum 4GB RAM
   - 20GB storage
   - Open ports: 80, 443, 1433 (SQL)

## 🌐 DNS Configuration

Add these DNS records to your domain:

```
Type    Name    Value               TTL
A       @       95.217.219.4        3600
A       *       95.217.219.4        3600
A       api     95.217.219.4        3600
A       www     95.217.219.4        3600
```

## 🔧 Coolify Deployment

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp deployment/coolify/.env.example deployment/coolify/.env
```

Edit the values:
- `DB_PASSWORD`: Strong password for SQL Server
- `JWT_SECRET`: Random 32+ character string
- `REDIS_PASSWORD`: Password for Redis cache

### 2. Deploy with Docker Compose

```bash
cd deployment/coolify
docker-compose up -d
```

### 3. SSL Certificate Setup

#### Option A: Let's Encrypt (Automatic)

Coolify handles this automatically with Traefik labels.

#### Option B: Manual Certificate

Place your wildcard certificate files:
- `/etc/nginx/ssl/stocker.app/fullchain.pem`
- `/etc/nginx/ssl/stocker.app/privkey.pem`

### 4. Database Migration

The application automatically runs migrations on startup. To manually run:

```bash
docker exec stocker-api dotnet ef database update
```

## 🏢 Multi-Tenant Architecture

### Subdomain Resolution Flow

1. User visits `acme.stocker.app`
2. Nginx/Traefik extracts subdomain (`acme`)
3. Passes `X-Tenant-Code: acme` header to API
4. TenantResolutionMiddleware identifies tenant
5. Application uses tenant-specific database

### Tenant Creation Flow

1. User registers at `www.stocker.app`
2. Chooses subdomain (e.g., `acme`)
3. System creates:
   - Tenant record in master database
   - Tenant-specific database (`StockerTenant_acme`)
   - User redirects to `acme.stocker.app`

## 🔒 Security Considerations

1. **Database Isolation**: Each tenant has separate database
2. **Subdomain Validation**: Only alphanumeric and hyphens allowed
3. **Reserved Subdomains**: System blocks (www, api, admin, etc.)
4. **CORS Configuration**: Wildcard subdomain CORS headers
5. **SSL/TLS**: Wildcard certificate for all subdomains

## 📊 Monitoring

### Health Checks

- API Health: `https://api.stocker.app/health`
- SignalR Health: `https://api.stocker.app/health/signalr`

### Logs

```bash
# API logs
docker logs stocker-api

# Frontend logs
docker logs stocker-web

# Database logs
docker logs mssql
```

## 🔄 Updates

### Rolling Update

```bash
cd deployment/coolify
docker-compose pull
docker-compose up -d --no-deps --build stocker-api stocker-web
```

### Database Backup

```bash
docker exec mssql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P $DB_PASSWORD \
  -Q "BACKUP DATABASE StockerMasterDb TO DISK = '/var/opt/mssql/backup/master.bak'"
```

## 🌍 Environment-Specific Settings

### Development (Local)

```javascript
// Frontend uses localStorage for subdomain simulation
localStorage.setItem('dev-subdomain', 'test-tenant');
```

### Production

- Wildcard SSL certificate required
- Redis for SignalR backplane
- Separate databases per tenant
- CDN for static assets (optional)

## 📝 Troubleshooting

### Common Issues

1. **Subdomain not resolving**
   - Check DNS propagation: `nslookup test.stocker.app`
   - Verify wildcard DNS record

2. **SSL Certificate errors**
   - Ensure wildcard certificate covers `*.stocker.app`
   - Check certificate expiration

3. **Tenant not found**
   - Verify X-Tenant-Code header is passed
   - Check TenantResolutionMiddleware logs

4. **Database connection issues**
   - Verify SQL Server is running
   - Check connection string in environment variables

### Debug Mode

Enable detailed logging:

```yaml
environment:
  - ASPNETCORE_ENVIRONMENT=Development
  - Logging__LogLevel__Default=Debug
```

## 📞 Support

For deployment assistance:
- GitHub Issues: https://github.com/your-repo/stocker/issues
- Documentation: https://docs.stocker.app

## 🚦 Status Monitoring

Set up monitoring for:
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry, Application Insights)
- Performance monitoring (New Relic, DataDog)
- SSL certificate expiration alerts

## 🔐 Backup Strategy

1. **Daily Backups**
   - Master database
   - All tenant databases
   - Uploaded files (if any)

2. **Backup Script**
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d)
   docker exec mssql /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U sa -P $DB_PASSWORD \
     -Q "EXEC sp_MSforeachdb 'BACKUP DATABASE ? TO DISK = ''/backup/?_$DATE.bak'''"
   ```

3. **Restore Process**
   - Stop application
   - Restore databases
   - Run migrations
   - Start application
# Coolify Environment Variables - Complete List

## 🗄️ PostgreSQL Database Service

**Service Name**: `postgres` (Database)
**Compose File**: `deployment/compose/infrastructure/database/docker-compose.yml`

### Environment Variables
```env
POSTGRES_USER=stocker_admin
POSTGRES_PASSWORD=KMVCh4TrpA6BPS2ZnZWgieqxEcFGXpGK
```

**Note**: `POSTGRES_DB` ve diğer değişkenler compose file'da default değerlere sahip.

---

## 🚀 Stocker API Service

**Service Name**: `stocker-api` (Application)
**Compose File**: `deployment/compose/services/api/docker-compose.yml`

### Critical Environment Variables (MUST SET)

#### Azure Key Vault (Connection String Provider)
```env
AZURE_KEY_VAULT_URI=https://stocker-kv-prod.vault.azure.net/
AZURE_TENANT_ID=<your-azure-tenant-id>
AZURE_CLIENT_ID=<your-azure-client-id>
AZURE_CLIENT_SECRET=<your-azure-client-secret>
```

#### PostgreSQL Connection (For Fallback)
```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=stocker_admin
POSTGRES_PASSWORD=KMVCh4TrpA6BPS2ZnZWgieqxEcFGXpGK
POSTGRES_DB=postgres
```

#### External Services
```env
# Seq Logging
SEQ_API_KEY=<your-seq-api-key>

# MinIO Storage
MINIO_ROOT_USER=<your-minio-user>
MINIO_ROOT_PASSWORD=<your-minio-password>

# Redis Cache
REDIS_PASSWORD=<your-redis-password>
```

### Optional Environment Variables (Have Defaults)

All other environment variables in the API compose file have default values and will work without setting them in Coolify. The critical ones are:
- Azure Key Vault credentials (for connection strings)
- External service credentials (Seq, MinIO, Redis)

---

## 📋 Deployment Order

### Step 1: Deploy PostgreSQL
1. Coolify → New Resource → Docker Compose
2. Name: `Stocker PostgreSQL`
3. Set compose file path: `deployment/compose/infrastructure/database/docker-compose.yml`
4. Environment Variables:
   ```
   POSTGRES_USER=stocker_admin
   POSTGRES_PASSWORD=KMVCh4TrpA6BPS2ZnZWgieqxEcFGXpGK
   ```
5. Deploy
6. Wait for health check: `docker logs postgres` should show successful initialization

### Step 2: Deploy API
1. Coolify → New Resource → Docker Compose
2. Name: `Stocker API`
3. Set compose file path: `deployment/compose/services/api/docker-compose.yml`
4. Set environment variables (see Critical Environment Variables above)
5. Deploy
6. Monitor logs: `docker logs stocker-api`

---

## 🔍 Verification Commands

### Check PostgreSQL
```bash
# Container status
docker ps | grep postgres

# Check logs
docker logs postgres | tail -50

# Connect and verify databases
docker exec -it postgres psql -U stocker_admin -d postgres -c "\l"
```

### Check API
```bash
# Container status
docker ps | grep stocker-api

# Check logs
docker logs stocker-api | tail -100

# Test health endpoint
curl https://api.stoocker.app/health

# Check Hangfire dashboard
curl https://api.stoocker.app/hangfire
```

### Verify Azure Key Vault Connection
```bash
# From API container
docker exec stocker-api env | grep AZURE

# Check API logs for Key Vault
docker logs stocker-api | grep "Key Vault"

# Expected output:
# ✅ Azure Key Vault configured successfully
```

### Verify Database Connection
```bash
# Check connection strings loaded
docker logs stocker-api | grep "ConnectionString"

# Verify migrations ran
docker logs stocker-api | grep "Migration"

# Expected output:
# ✅ Running migrations for Master database...
# ✅ Running migrations for Tenant database...
```

---

## 🚨 Troubleshooting

### Issue: API can't find postgres
**Error**: `Host 'postgres' not found`

**Solution**:
```bash
# Verify both services are on 'coolify' network
docker network inspect coolify | grep postgres
docker network inspect coolify | grep stocker-api

# Both should be listed
```

### Issue: Azure Key Vault connection fails
**Error**: `Failed to configure Azure Key Vault`

**Solution**:
```bash
# 1. Check environment variables are set
docker exec stocker-api printenv | grep AZURE

# 2. Verify service principal has access
# Go to Azure Portal → Key Vault → Access Policies
# Ensure service principal has "Get" and "List" permissions

# 3. Test with Azure CLI
az keyvault secret list --vault-name stocker-kv-prod
```

### Issue: Migrations fail
**Error**: `Migration ... failed`

**Solution**:
```bash
# 1. Verify databases exist
docker exec -it postgres psql -U stocker_admin -d postgres -c "\l"

# 2. Check database connectivity from API
docker exec stocker-api ping postgres

# 3. Run migration manually
docker exec stocker-api dotnet ef database update --project src/Infrastructure/Stocker.Persistence --context MasterDbContext
```

---

## 📝 Complete Environment Variable Reference

### Variables That MUST Be Set in Coolify

```env
# Azure Key Vault (Critical!)
AZURE_KEY_VAULT_URI=https://stocker-kv-prod.vault.azure.net/
AZURE_TENANT_ID=<required>
AZURE_CLIENT_ID=<required>
AZURE_CLIENT_SECRET=<required>

# PostgreSQL (For fallback/health checks)
POSTGRES_PASSWORD=KMVCh4TrpA6BPS2ZnZWgieqxEcFGXpGK

# External Services
SEQ_API_KEY=<required>
MINIO_ROOT_USER=<required>
MINIO_ROOT_PASSWORD=<required>
REDIS_PASSWORD=<required>
```

### Variables With Defaults (Optional)

These are already set in docker-compose.yml with sensible defaults:

```env
# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5000
ASPNETCORE_SWAGGER_ENABLED=true

# PostgreSQL Connection (Defaults)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=stocker_admin
POSTGRES_DB=postgres

# Database Settings
DB_HOST=postgres
DB_PORT=5432
DB_USER=stocker_admin

# Hangfire
Hangfire__DashboardPath=/hangfire
Hangfire__ServerName=Stocker-Server
Hangfire__WorkerCount=4
Hangfire__Queues=critical,default,low
Hangfire__RetryAttempts=3
HANGFIRE_DB_NAME=stocker_hangfire

# JWT Settings
JwtSettings__Issuer=Stocker
JwtSettings__Audience=Stocker
JwtSettings__AccessTokenExpirationMinutes=60
JwtSettings__RefreshTokenExpirationDays=7

# Email Settings
EmailSettings__FromEmail=info@stoocker.app
EmailSettings__FromName=Stoocker
EmailSettings__EnableSsl=true
EmailSettings__UseStartTls=true
EmailSettings__EnableEmail=true
EmailSettings__BaseUrl=https://stoocker.app
EmailSettings__TemplatesPath=EmailTemplates

# MinIO Storage
MinioStorage__Endpoint=minio:9000
MinioStorage__PublicEndpoint=https://s3.stoocker.app
MinioStorage__BucketName=stocker-documents
MinioStorage__UseSSL=false
MinioStorage__Region=us-east-1

# Redis Cache
Redis__ConnectionString=redis:6379
Redis__DefaultDatabase=0
Redis__ConnectTimeout=5000
Redis__SyncTimeout=5000

# RabbitMQ
RabbitMQ__Enabled=true
RabbitMQ__Host=rabbitmq
RabbitMQ__VirtualHost=/
RabbitMQ__Username=admin
RabbitMQ__Port=5672
RabbitMQ__UseSsl=false
RabbitMQ__Heartbeat=60
RabbitMQ__RequestedConnectionTimeout=30000
RabbitMQ__PrefetchCount=32
RabbitMQ__RetryCount=3
RabbitMQ__RetryInterval=5

# Logging (Seq)
Logging__Seq__ServerUrl=https://seq.stoocker.app
Logging__Seq__MinimumLevel=Information

# Password Policy
PasswordPolicy__MinimumLength=8
PasswordPolicy__MaximumLength=128
PasswordPolicy__RequireUppercase=true
PasswordPolicy__RequireLowercase=true
PasswordPolicy__RequireDigit=true
PasswordPolicy__RequireNonAlphanumeric=true
PasswordPolicy__RequiredUniqueChars=4
PasswordPolicy__PreventCommonPasswords=true
PasswordPolicy__PreventUserInfoInPassword=true
PasswordPolicy__PasswordHistoryCount=5
PasswordPolicy__PasswordExpirationDays=90
PasswordPolicy__MaxFailedAccessAttempts=5
PasswordPolicy__LockoutDurationMinutes=15
PasswordPolicy__MinimumStrengthScore=3

# Security Headers
SecurityHeaders__AddXContentTypeOptions=true
SecurityHeaders__AddXFrameOptions=true
SecurityHeaders__XFrameOptionsValue=DENY
SecurityHeaders__AddXXssProtection=true
SecurityHeaders__AddReferrerPolicy=true
SecurityHeaders__ReferrerPolicyValue=strict-origin-when-cross-origin
SecurityHeaders__AddContentSecurityPolicy=true
SecurityHeaders__AddStrictTransportSecurity=true
SecurityHeaders__HstsMaxAge=31536000
SecurityHeaders__HstsIncludeSubDomains=true
SecurityHeaders__HstsPreload=false

# Rate Limiting
TenantRateLimiting__Algorithm=SlidingWindow
TenantRateLimiting__PermitLimit=100
TenantRateLimiting__WindowSeconds=60
TenantRateLimiting__QueueLimit=5
TenantRateLimiting__SegmentsPerWindow=4
TenantRateLimiting__TokensPerPeriod=10
TenantRateLimiting__ReplenishmentPeriodSeconds=1
```

---

## ✅ Minimal Setup (Quick Start)

If you just want to get it running quickly, set ONLY these:

```env
# PostgreSQL Service
POSTGRES_PASSWORD=KMVCh4TrpA6BPS2ZnZWgieqxEcFGXpGK

# API Service
AZURE_KEY_VAULT_URI=https://stocker-kv-prod.vault.azure.net/
AZURE_TENANT_ID=<your-tenant-id>
AZURE_CLIENT_ID=<your-client-id>
AZURE_CLIENT_SECRET=<your-client-secret>
SEQ_API_KEY=<your-seq-key>
MINIO_ROOT_USER=<your-minio-user>
MINIO_ROOT_PASSWORD=<your-minio-pass>
REDIS_PASSWORD=<your-redis-pass>
```

All other variables have working defaults in the compose file.

---

**Document Version**: 1.0
**Last Updated**: November 23, 2025
**Status**: Ready for Deployment ✅

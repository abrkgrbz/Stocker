# Coolify Deployment Guide - PostgreSQL Migration

## 🎯 Quick Deployment Steps

### 1️⃣ PostgreSQL Database Service

**Compose File**: `deployment/compose/infrastructure/database/docker-compose.yml`

**Environment Variables** (Set in Coolify Project):
```env
POSTGRES_USER=stocker_admin
POSTGRES_PASSWORD=<from Azure Key Vault: postgres-password>
```

**Deploy Command**:
```bash
docker-compose -f deployment/compose/infrastructure/database/docker-compose.yml up -d
```

**Verification**:
```bash
# Check service health
docker ps | grep postgres

# Check logs for successful initialization
docker logs postgres | grep "PostgreSQL databases and schemas created successfully"
```

---

### 2️⃣ Stocker API Service

**Compose File**: `deployment/compose/services/api/docker-compose.yml`

**Required Environment Variables** (Set in Coolify Project):
```env
# PostgreSQL Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=stocker_admin
POSTGRES_PASSWORD=<same as database service>
POSTGRES_DB=postgres

# Azure Key Vault (Critical!)
AZURE_KEY_VAULT_URI=https://stocker-kv-prod.vault.azure.net/
AZURE_TENANT_ID=<your-azure-tenant-id>
AZURE_CLIENT_ID=<your-azure-client-id>
AZURE_CLIENT_SECRET=<your-azure-client-secret>

# External Services
SEQ_API_KEY=<your-seq-api-key>
MINIO_ROOT_USER=<your-minio-user>
MINIO_ROOT_PASSWORD=<your-minio-password>
REDIS_PASSWORD=<your-redis-password>
```

**Deploy Command**:
```bash
docker-compose -f deployment/compose/services/api/docker-compose.yml up -d --build
```

**Verification**:
```bash
# Check API health
curl https://api.stoocker.app/health

# Check API logs
docker logs stocker-api | grep "✅"

# Expected logs:
# ✅ Azure Key Vault configured successfully
# ✅ Hangfire database created successfully
# ✅ Running migrations for Master database...
# ✅ Running migrations for Tenant database...
```

---

## 🔑 Azure Key Vault Secrets (Already Updated ✅)

The following secrets have been updated in `stocker-kv-prod`:

```yaml
connectionstrings-masterconnection:
  Database: stocker_master
  Format: Npgsql (PostgreSQL)

connectionstrings-tenantconnection:
  Database: stocker_tenant
  Format: Npgsql (PostgreSQL)

connectionstrings-hangfireconnection:
  Database: stocker_hangfire
  Format: Npgsql (PostgreSQL)

connectionstrings-defaultconnection:
  Database: stocker_tenant
  Format: Npgsql (PostgreSQL)

postgres-password:
  Value: KMVCh4TrpA6BPS2ZnZWgieqxEcFGXpGK
  Usage: PostgreSQL admin password
```

**Note**: API will automatically load these connection strings from Azure Key Vault on startup. No need to set `ConnectionStrings__*` environment variables in Coolify.

---

## 📊 Service Dependencies

```
postgres (database)
   ↓
stocker-api (depends on postgres)
   ↓
redis, rabbitmq, minio, seq (external services)
```

**Important**: Deploy services in order:
1. PostgreSQL database first
2. Wait for database health check to pass
3. Then deploy API (it will auto-wait for postgres due to `depends_on`)

---

## 🚀 Deployment Sequence in Coolify

### Step 1: Create/Update PostgreSQL Service
1. Go to Coolify → Project → Services
2. Create new service or update existing database service
3. Set compose file path: `deployment/compose/infrastructure/database/docker-compose.yml`
4. Set environment variables (POSTGRES_USER, POSTGRES_PASSWORD)
5. Deploy

### Step 2: Verify PostgreSQL Initialization
```bash
# SSH to Coolify server
ssh your-server

# Check PostgreSQL logs
docker logs postgres

# Should see:
# ✅ PostgreSQL databases and schemas created successfully!
#    - stocker_master (schema: master)
#    - stocker_tenant (schema: tenant, crm)
#    - stocker_hangfire (schema: hangfire)
```

### Step 3: Update/Deploy API Service
1. Go to Coolify → Project → Services
2. Update API service or create new one
3. Set compose file path: `deployment/compose/services/api/docker-compose.yml`
4. Set all required environment variables (see list above)
5. **Critical**: Ensure AZURE_KEY_VAULT_URI and credentials are set correctly
6. Deploy

### Step 4: Monitor API Startup
```bash
# Watch API logs in real-time
docker logs -f stocker-api

# Look for these success messages:
# 🔑 Attempting to configure Azure Key Vault
# ✅ Azure Key Vault configured successfully
# 🔧 Initializing PostgreSQL databases
# ✅ Hangfire database created successfully
# ✅ Running migrations for Master database...
# ✅ Running migrations for Tenant database...
# 🎉 Stocker API started successfully
```

---

## ⚠️ Critical Configuration Points

### 1. Azure Key Vault Authentication
```env
# These MUST be correct for API to load connection strings
AZURE_KEY_VAULT_URI=https://stocker-kv-prod.vault.azure.net/
AZURE_TENANT_ID=<your-tenant-id>
AZURE_CLIENT_ID=<your-client-id>
AZURE_CLIENT_SECRET=<your-client-secret>
```

**Verify**:
```bash
# Test Azure Key Vault access from API container
docker exec stocker-api env | grep AZURE

# Check API logs for Key Vault connection
docker logs stocker-api | grep "Key Vault"
```

### 2. PostgreSQL Network Connectivity
```env
# API uses internal Docker network name: postgres
POSTGRES_HOST=postgres  # NOT localhost or IP
POSTGRES_PORT=5432
```

**Verify**:
```bash
# From API container, ping postgres service
docker exec stocker-api ping -c 2 postgres

# Should resolve and respond
```

### 3. Database Initialization
- Initialization script (`init-postgres.sh`) runs ONLY on first container creation
- Creates: stocker_master, stocker_tenant, stocker_hangfire databases
- Creates schemas: master, tenant, crm, hangfire
- Grants privileges to stocker_admin user

**If you need to reinitialize**:
```bash
# Delete PostgreSQL volume and redeploy
docker-compose down -v
docker-compose up -d
```

---

## 🔍 Health Checks

### API Health Endpoint
```bash
# Should return HTTP 200 with JSON health status
curl https://api.stoocker.app/health

# Expected response:
{
  "status": "Healthy",
  "checks": {
    "database": "Healthy",
    "hangfire": "Healthy"
  }
}
```

### Hangfire Dashboard
- URL: `https://api.stoocker.app/hangfire`
- Check for: Active servers, scheduled jobs, processing queue

### Database Connectivity
```bash
# Connect to PostgreSQL from API container
docker exec stocker-api dotnet ef database update --project src/Infrastructure/Stocker.Persistence --context MasterDbContext

# Should succeed without errors
```

---

## 🚨 Common Issues & Solutions

### Issue: API can't connect to Azure Key Vault
**Symptoms**: Logs show "Failed to configure Azure Key Vault"

**Solution**:
```bash
# 1. Verify environment variables are set
docker exec stocker-api printenv | grep AZURE

# 2. Test Key Vault access with Azure CLI
az keyvault secret list --vault-name stocker-kv-prod

# 3. Check service principal has Key Vault access:
# - Go to Azure Portal → Key Vault → Access Policies
# - Ensure service principal has "Get" and "List" secret permissions
```

### Issue: API can't connect to PostgreSQL
**Symptoms**: Logs show "Connection refused" or "Host not found"

**Solution**:
```bash
# 1. Verify postgres service is running
docker ps | grep postgres

# 2. Check network connectivity
docker exec stocker-api ping postgres

# 3. Verify environment variables
docker exec stocker-api printenv | grep POSTGRES

# 4. Check PostgreSQL accepts connections
docker exec postgres psql -U stocker_admin -d postgres -c "SELECT version();"
```

### Issue: Migrations fail
**Symptoms**: "Migration ... failed" in logs

**Solution**:
```bash
# 1. Check database exists
docker exec -it postgres psql -U stocker_admin -d postgres -c "\l"

# 2. Check schema exists
docker exec -it postgres psql -U stocker_admin -d stocker_master -c "\dn"

# 3. Run migration manually
docker exec stocker-api dotnet ef database update --project src/Infrastructure/Stocker.Persistence --context MasterDbContext

# 4. Check migration history
docker exec -it postgres psql -U stocker_admin -d stocker_master -c "SELECT * FROM master.__EFMigrationsHistory;"
```

### Issue: Hangfire not working
**Symptoms**: Hangfire dashboard shows no servers or jobs

**Solution**:
```bash
# 1. Check Hangfire database and schema exist
docker exec -it postgres psql -U stocker_admin -d stocker_hangfire -c "\dn"

# 2. Check Hangfire tables exist
docker exec -it postgres psql -U stocker_admin -d stocker_hangfire -c "\dt hangfire.*"

# 3. Check API logs for Hangfire initialization
docker logs stocker-api | grep "Hangfire"

# 4. Restart API to reinitialize
docker-compose restart api
```

---

## 📈 Post-Deployment Monitoring

### First 24 Hours
- Monitor API logs for errors: `docker logs -f stocker-api`
- Check PostgreSQL performance: `docker exec postgres pg_stat_statements`
- Monitor Hangfire dashboard for job processing
- Verify all multi-tenant operations work
- Check Seq for application logs

### Metrics to Watch
- **Database Connections**: Should stay below 200 (max_connections)
- **API Response Time**: Should be < 500ms for most endpoints
- **Hangfire Job Processing**: Jobs should complete without failures
- **Memory Usage**: API should stay below 2GB, PostgreSQL below 2GB

### Performance Baseline
```bash
# PostgreSQL stats
docker exec -it postgres psql -U stocker_admin -d postgres -c "
SELECT
  datname,
  numbackends as connections,
  pg_size_pretty(pg_database_size(datname)) as size
FROM pg_stat_database
WHERE datname LIKE 'stocker_%';"

# Connection pool stats
docker exec -it postgres psql -U stocker_admin -d postgres -c "
SELECT count(*), state
FROM pg_stat_activity
GROUP BY state;"
```

---

## ✅ Deployment Checklist

**Pre-Deployment**:
- [ ] Azure Key Vault updated with PostgreSQL secrets ✅
- [ ] Coolify environment variables reviewed
- [ ] Backup any existing SQL Server data (if applicable)
- [ ] Team notified of deployment window

**Deployment**:
- [ ] Deploy PostgreSQL database service
- [ ] Verify PostgreSQL initialization logs
- [ ] Set all required API environment variables
- [ ] Deploy API service
- [ ] Monitor API startup logs

**Post-Deployment**:
- [ ] Test health endpoint: `curl https://api.stoocker.app/health`
- [ ] Access Hangfire dashboard: `https://api.stoocker.app/hangfire`
- [ ] Test user registration/login
- [ ] Verify background jobs execute
- [ ] Check Seq for application logs
- [ ] Monitor for 1 hour, then 24 hours

---

## 📞 Support Contacts

**Deployment Issues**: DevOps Team
**Database Issues**: DBA Team
**Application Issues**: Development Team
**Emergency**: Follow incident response procedures

---

**Document Version**: 1.0
**Last Updated**: November 23, 2025
**Status**: Ready for Production Deployment ✅

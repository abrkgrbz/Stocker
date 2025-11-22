# PostgreSQL Migration Guide - Stocker SaaS Platform

## Overview
Complete guide for migrating Stocker multi-tenant SaaS platform from SQL Server 2022 to PostgreSQL 17.

**Migration Date**: November 23, 2025
**PostgreSQL Version**: 17 (Alpine)
**Previous Database**: SQL Server 2022

---

## 🎯 Migration Summary

### What Changed
- ✅ **Database Provider**: SQL Server → PostgreSQL 17
- ✅ **NuGet Packages**: Updated all database-related packages
- ✅ **Code Changes**: 5 files modified for PostgreSQL compatibility
- ✅ **Migrations**: 83 old migrations backed up, 3 new PostgreSQL migrations created
- ✅ **Connection Strings**: All formats updated to Npgsql format
- ✅ **Azure Key Vault**: Updated with PostgreSQL connection strings
- ✅ **Docker Compose**: Updated database and API service configurations
- ✅ **Hangfire**: Configured for PostgreSQL storage
- ✅ **Serilog**: Configured for PostgreSQL sink

### Databases
```
stocker_master    → Master database with schema: master
stocker_tenant    → Tenant database with schemas: tenant, crm
stocker_hangfire  → Background jobs database with schema: hangfire
```

---

## 📋 Pre-Deployment Checklist

### 1. Backup Existing Data (If Applicable)
```bash
# If you have existing SQL Server data, back it up first
# This migration creates fresh PostgreSQL databases
# Data migration from SQL Server to PostgreSQL is NOT included
```

### 2. Verify Azure Key Vault Update
```bash
# Verify secrets are updated in Azure Key Vault
az keyvault secret list --vault-name stocker-kv-prod --query "[].name" -o table

# Should see:
# - connectionstrings-masterconnection
# - connectionstrings-tenantconnection
# - connectionstrings-hangfireconnection
# - connectionstrings-defaultconnection
# - postgres-password
```

### 3. Review Environment Variables
Ensure your Coolify project has these environment variables:

```env
# PostgreSQL Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=stocker_admin
POSTGRES_PASSWORD=<from Azure Key Vault: postgres-password>
POSTGRES_DB=postgres

# Azure Key Vault (for connection strings)
AZURE_KEY_VAULT_URI=https://stocker-kv-prod.vault.azure.net/
AZURE_TENANT_ID=<your-tenant-id>
AZURE_CLIENT_ID=<your-client-id>
AZURE_CLIENT_SECRET=<your-client-secret>

# Database connection strings will be auto-loaded from Azure Key Vault
# No need to set ConnectionStrings__* in Coolify
```

---

## 🚀 Deployment Steps

### Step 1: Deploy PostgreSQL Database

```bash
# Navigate to database compose directory
cd deployment/compose/infrastructure/database

# Deploy PostgreSQL with Coolify
# Make sure postgres service is deployed first
docker-compose up -d postgres

# Verify database is healthy
docker-compose ps postgres
docker logs postgres
```

**Expected Output**:
```
✅ PostgreSQL databases and schemas created successfully!
   - stocker_master (schema: master)
   - stocker_tenant (schema: tenant, crm)
   - stocker_hangfire (schema: hangfire)
```

### Step 2: Verify Database Initialization

```bash
# Connect to PostgreSQL container
docker exec -it postgres psql -U stocker_admin -d postgres

# Check databases
\l

# Should see:
# - stocker_master
# - stocker_tenant
# - stocker_hangfire

# Check schemas in each database
\c stocker_master
\dn

# Should see: master schema

\c stocker_tenant
\dn

# Should see: tenant, crm schemas

\c stocker_hangfire
\dn

# Should see: hangfire schema

# Exit
\q
```

### Step 3: Deploy API Service

```bash
# Navigate to API compose directory
cd deployment/compose/services/api

# Build and deploy API
# API will:
# 1. Connect to Azure Key Vault
# 2. Load PostgreSQL connection strings
# 3. Run EF Core migrations automatically
# 4. Initialize Hangfire schema

docker-compose up -d --build

# Monitor API startup
docker logs -f stocker-api
```

**Expected Startup Logs**:
```
🔑 Attempting to configure Azure Key Vault: https://stocker-kv-prod.vault.azure.net/
✅ Azure Key Vault configured successfully
🔧 Initializing PostgreSQL databases for Stocker...
✅ Hangfire database created successfully: stocker_hangfire
✅ Hangfire schema created successfully
✅ Running migrations for Master database...
✅ Running migrations for Tenant database...
✅ Running migrations for CRM database...
🎉 Stocker API started successfully
```

### Step 4: Verify Application Health

```bash
# Check API health endpoint
curl https://api.stoocker.app/health

# Expected: HTTP 200 OK with health status

# Check Hangfire dashboard
# Navigate to: https://api.stoocker.app/hangfire

# Verify database connections
docker exec -it stocker-api dotnet ef database update --project src/Infrastructure/Stocker.Persistence --context MasterDbContext
```

---

## 🔍 Verification Steps

### 1. Database Connection Test
```bash
# Connect to each database and verify tables exist
docker exec -it postgres psql -U stocker_admin -d stocker_master

# Check tables in master schema
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'master'
ORDER BY table_name;

# Should see: Tenants, Users, SystemSettings, EmailVerificationTokens, etc.
```

### 2. Hangfire Verification
```bash
# Check Hangfire schema
docker exec -it postgres psql -U stocker_admin -d stocker_hangfire

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'hangfire'
ORDER BY table_name;

# Should see: job, jobparameter, jobqueue, server, set, state, etc.
```

### 3. Logging Verification
```bash
# Check logs table in master database
docker exec -it postgres psql -U stocker_admin -d stocker_master

SELECT COUNT(*) FROM master.logs;

# Should return count of log entries (may be 0 initially)
```

### 4. Application Functionality Test
- ✅ User registration/login
- ✅ Tenant creation
- ✅ Background jobs processing
- ✅ Logging to database
- ✅ Multi-tenancy operations

---

## 🔧 Configuration Details

### PostgreSQL Connection String Format
```
Host=postgres;Port=5432;Database=stocker_master;Username=stocker_admin;Password=<password>;SSL Mode=Prefer;Trust Server Certificate=true;Include Error Detail=true
```

### Azure Key Vault Secrets
```yaml
connectionstrings-masterconnection:
  value: "Host=postgres;Port=5432;Database=stocker_master;..."

connectionstrings-tenantconnection:
  value: "Host=postgres;Port=5432;Database=stocker_tenant;..."

connectionstrings-hangfireconnection:
  value: "Host=postgres;Port=5432;Database=stocker_hangfire;..."

connectionstrings-defaultconnection:
  value: "Host=postgres;Port=5432;Database=stocker_tenant;..."

postgres-password:
  value: "KMVCh4TrpA6BPS2ZnZWgieqxEcFGXpGK"
```

### PostgreSQL Performance Tuning (Applied)
```ini
max_connections=200
shared_buffers=512MB
effective_cache_size=1536MB
maintenance_work_mem=128MB
checkpoint_completion_target=0.9
wal_buffers=16MB
default_statistics_target=100
random_page_cost=1.1
effective_io_concurrency=200
work_mem=2621kB
min_wal_size=1GB
max_wal_size=4GB
```

---

## 📦 Backup and Restore

### PostgreSQL Backup
```bash
# Backup all databases
docker exec postgres pg_dumpall -U stocker_admin > /var/lib/postgresql/backup/stocker_all_$(date +%Y%m%d_%H%M%S).sql

# Backup specific database
docker exec postgres pg_dump -U stocker_admin stocker_master > /var/lib/postgresql/backup/stocker_master_$(date +%Y%m%d_%H%M%S).sql
```

### PostgreSQL Restore
```bash
# Restore from backup
docker exec -i postgres psql -U stocker_admin -d postgres < backup_file.sql
```

---

## 🚨 Troubleshooting

### Issue: API Cannot Connect to PostgreSQL
**Solution**:
```bash
# 1. Check PostgreSQL is healthy
docker-compose ps postgres

# 2. Check PostgreSQL logs
docker logs postgres

# 3. Verify network connectivity
docker exec stocker-api ping postgres

# 4. Check Azure Key Vault connection
docker logs stocker-api | grep "Azure Key Vault"
```

### Issue: Migrations Fail
**Solution**:
```bash
# 1. Check database exists
docker exec -it postgres psql -U stocker_admin -d postgres -c "\l"

# 2. Run migrations manually
docker exec -it stocker-api dotnet ef database update --project src/Infrastructure/Stocker.Persistence --context MasterDbContext

# 3. Check migration history
docker exec -it postgres psql -U stocker_admin -d stocker_master -c "SELECT * FROM master.__EFMigrationsHistory;"
```

### Issue: Hangfire Dashboard Not Working
**Solution**:
```bash
# 1. Check Hangfire database and schema
docker exec -it postgres psql -U stocker_admin -d stocker_hangfire -c "\dn"

# 2. Check Hangfire tables
docker exec -it postgres psql -U stocker_admin -d stocker_hangfire -c "\dt hangfire.*"

# 3. Restart API to reinitialize Hangfire
docker-compose restart api
```

### Issue: Azure Key Vault Connection Fails
**Solution**:
```bash
# 1. Verify environment variables
docker exec stocker-api printenv | grep AZURE

# 2. Test Azure CLI access
az keyvault secret show --vault-name stocker-kv-prod --name postgres-password

# 3. Check API logs for Key Vault errors
docker logs stocker-api | grep "Key Vault"
```

---

## 📊 Monitoring

### PostgreSQL Monitoring
```bash
# Current connections
docker exec -it postgres psql -U stocker_admin -d postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Database sizes
docker exec -it postgres psql -U stocker_admin -d postgres -c "\l+"

# Active queries
docker exec -it postgres psql -U stocker_admin -d postgres -c "SELECT pid, usename, datname, state, query FROM pg_stat_activity WHERE state = 'active';"
```

### Hangfire Monitoring
- Dashboard: `https://api.stoocker.app/hangfire`
- Monitor: Jobs, Servers, Recurring Jobs, Retries, Processing

### Logging
- Application logs: `docker logs stocker-api`
- Database logs: `docker logs postgres`
- Seq dashboard: `https://seq.stoocker.app`

---

## 🔄 Rollback Plan

### If Issues Occur During Migration

**Option 1: Rollback to SQL Server**
```bash
# 1. Stop API and PostgreSQL
docker-compose down

# 2. Revert code changes
git checkout <previous-commit-before-postgresql>

# 3. Restore SQL Server connection strings in Azure Key Vault
# Run: deployment/scripts/restore-sqlserver-keyvault.sh (create if needed)

# 4. Deploy SQL Server database service
# 5. Restart API with SQL Server configuration
```

**Option 2: Fix Forward**
```bash
# 1. Check specific error in logs
docker logs stocker-api
docker logs postgres

# 2. Apply fix (migrations, configuration, etc.)

# 3. Restart services
docker-compose restart

# 4. Verify functionality
```

---

## ✅ Post-Migration Tasks

- [ ] Update monitoring dashboards for PostgreSQL metrics
- [ ] Configure automated PostgreSQL backups
- [ ] Set up point-in-time recovery (PITR)
- [ ] Update documentation with PostgreSQL specifics
- [ ] Train team on PostgreSQL operations
- [ ] Configure PostgreSQL-specific alerts
- [ ] Review and optimize PostgreSQL performance
- [ ] Update disaster recovery procedures

---

## 📚 Resources

### PostgreSQL Documentation
- [PostgreSQL 17 Official Docs](https://www.postgresql.org/docs/17/)
- [Npgsql Entity Framework Core Provider](https://www.npgsql.org/efcore/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

### Migration Resources
- [Entity Framework Core Migrations](https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [Hangfire with PostgreSQL](https://www.hangfire.io/overview.html)
- [Serilog PostgreSQL Sink](https://github.com/b00ted/serilog-sinks-postgresql)

### Support
- **Issues**: Report to development team
- **Questions**: Contact DevOps team
- **Emergency**: Follow incident response procedures

---

## 🎉 Success Criteria

Migration is considered successful when:

- ✅ All 3 databases (master, tenant, hangfire) created and initialized
- ✅ API starts without errors and loads configuration from Azure Key Vault
- ✅ Health endpoint returns HTTP 200
- ✅ EF Core migrations applied successfully
- ✅ Hangfire dashboard accessible and processing jobs
- ✅ Logging to PostgreSQL works
- ✅ Multi-tenant operations function correctly
- ✅ No connection errors in logs
- ✅ Background jobs execute successfully
- ✅ Performance meets requirements

---

## 📝 Migration Log

### Phase 1: Code Changes (Completed ✅)
- Updated NuGet packages (3 files)
- Modified code for PostgreSQL (5 files)
- Updated configuration files (2 files)

### Phase 2: Migration Regeneration (Completed ✅)
- Backed up 83 old SQL Server migrations
- Generated 3 new PostgreSQL migrations
- Verified successful build

### Phase 3: Infrastructure Update (Completed ✅)
- Created PostgreSQL Docker Compose configuration
- Created database initialization script
- Updated API Docker Compose for PostgreSQL

### Phase 4: Azure Key Vault Update (Completed ✅)
- Generated secure PostgreSQL password
- Updated 4 connection string secrets
- Added postgres-password secret

### Phase 5: Deployment (Pending ⏳)
- Deploy PostgreSQL database service
- Deploy API service
- Verify functionality

### Phase 6: Validation (Pending ⏳)
- Run verification tests
- Monitor for 24 hours
- Performance validation

---

**Document Version**: 1.0
**Last Updated**: November 23, 2025
**Owner**: DevOps Team
**Status**: Ready for Deployment

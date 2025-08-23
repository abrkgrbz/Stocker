# Coolify Environment Variables Setup

## CRITICAL: Database Connection Configuration

Your current Coolify setup has only `DB_CONNECTION` environment variable pointing to TenantDb.
The application requires **THREE separate database connection strings**:

### Required Environment Variables in Coolify:

```env
# Master Database Connection (for Hangfire, system tables)
MASTER_DB_CONNECTION=Server=coolify.stoocker.app;Database=StockerMasterDb;User Id=sa;Password=YourActualPassword;TrustServerCertificate=true;MultipleActiveResultSets=true

# Tenant Database Connection (for tenant-specific data)
TENANT_DB_CONNECTION=Server=coolify.stoocker.app;Database=StockerTenantDb;User Id=sa;Password=YourActualPassword;TrustServerCertificate=true;MultipleActiveResultSets=true

# Default Connection (usually same as Tenant)
DB_CONNECTION=Server=coolify.stoocker.app;Database=StockerTenantDb;User Id=sa;Password=YourActualPassword;TrustServerCertificate=true;MultipleActiveResultSets=true

# Other Required Variables
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-2024
EMAIL_PASSWORD=A.bg010203
REDIS_CONNECTION=coolify.stoocker.app:6379
ADMIN_DEFAULT_PASSWORD=Admin123!
SA_PASSWORD=YourActualPassword
```

## Why This Is Important:

1. **MasterDb** stores:
   - Hangfire tables and jobs
   - System-wide configuration
   - Tenant registry

2. **TenantDb** stores:
   - Tenant-specific data
   - User accounts per tenant
   - Business data

## How to Add in Coolify:

1. Go to your API service in Coolify
2. Navigate to Environment Variables section
3. Add each variable above
4. Make sure to replace `YourActualPassword` with your actual database password
5. Save and redeploy

## Verification:

After deployment, check:
1. API logs to ensure both databases connect successfully
2. Hangfire dashboard at https://api.stoocker.app/hangfire
3. Health check at https://api.stoocker.app/health/detailed

## Current Issue:
Without `MASTER_DB_CONNECTION`, Hangfire tables are being created in TenantDb instead of MasterDb, causing confusion and potential issues.
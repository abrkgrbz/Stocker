# Azure Key Vault PostgreSQL Migration Script (PowerShell)
# This script updates all database connection strings to PostgreSQL format

Write-Host "🔐 Azure Key Vault PostgreSQL Migration Script" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$KEYVAULT_NAME = "stocker-kv-prod"
$POSTGRES_PASSWORD = "KMVCh4TrpA6BPS2ZnZWgieqxEcFGXpGK"
$POSTGRES_USER = "stocker_admin"
$POSTGRES_HOST = "postgres"  # For Coolify internal network
$POSTGRES_PORT = "5432"

# For Azure PostgreSQL (if using managed service instead of container)
# $POSTGRES_HOST = "stocker-pg-prod.postgres.database.azure.com"
# $POSTGRES_PORT = "5432"
# Add SSL Mode=Require for Azure

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Key Vault: $KEYVAULT_NAME"
Write-Host "  PostgreSQL Host: $POSTGRES_HOST"
Write-Host "  PostgreSQL User: $POSTGRES_USER"
Write-Host "  PostgreSQL Port: $POSTGRES_PORT"
Write-Host ""

# Check if Azure CLI is installed
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Azure CLI not found. Please install Azure CLI first." -ForegroundColor Red
    Write-Host "   Download from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

# Login to Azure (if not already logged in)
Write-Host "🔑 Checking Azure login status..." -ForegroundColor Cyan
try {
    $account = az account show 2>&1 | ConvertFrom-Json
    Write-Host "✅ Logged in to Azure" -ForegroundColor Green
    Write-Host "   Subscription: $($account.name)" -ForegroundColor Gray
} catch {
    Write-Host "Please login to Azure first:" -ForegroundColor Yellow
    az login
}
Write-Host ""

# Update connection strings
Write-Host "🔄 Updating connection strings in Key Vault..." -ForegroundColor Cyan
Write-Host ""

# 1. MasterConnection
Write-Host "1️⃣  Updating: connectionstrings-masterconnection" -ForegroundColor Yellow
$masterConnStr = "Host=$POSTGRES_HOST;Port=$POSTGRES_PORT;Database=stocker_master;Username=$POSTGRES_USER;Password=$POSTGRES_PASSWORD;SSL Mode=Prefer;Trust Server Certificate=true;Include Error Detail=true"
az keyvault secret set `
  --vault-name $KEYVAULT_NAME `
  --name "connectionstrings-masterconnection" `
  --value $masterConnStr `
  --output none

Write-Host "   ✅ Updated successfully" -ForegroundColor Green

# 2. TenantConnection
Write-Host "2️⃣  Updating: connectionstrings-tenantconnection" -ForegroundColor Yellow
$tenantConnStr = "Host=$POSTGRES_HOST;Port=$POSTGRES_PORT;Database=stocker_tenant;Username=$POSTGRES_USER;Password=$POSTGRES_PASSWORD;SSL Mode=Prefer;Trust Server Certificate=true;Include Error Detail=true"
az keyvault secret set `
  --vault-name $KEYVAULT_NAME `
  --name "connectionstrings-tenantconnection" `
  --value $tenantConnStr `
  --output none

Write-Host "   ✅ Updated successfully" -ForegroundColor Green

# 3. HangfireConnection
Write-Host "3️⃣  Updating: connectionstrings-hangfireconnection" -ForegroundColor Yellow
$hangfireConnStr = "Host=$POSTGRES_HOST;Port=$POSTGRES_PORT;Database=stocker_hangfire;Username=$POSTGRES_USER;Password=$POSTGRES_PASSWORD;SSL Mode=Prefer;Trust Server Certificate=true;Include Error Detail=true"
az keyvault secret set `
  --vault-name $KEYVAULT_NAME `
  --name "connectionstrings-hangfireconnection" `
  --value $hangfireConnStr `
  --output none

Write-Host "   ✅ Updated successfully" -ForegroundColor Green

# 4. DefaultConnection
Write-Host "4️⃣  Updating: connectionstrings-defaultconnection" -ForegroundColor Yellow
$defaultConnStr = "Host=$POSTGRES_HOST;Port=$POSTGRES_PORT;Database=stocker_tenant;Username=$POSTGRES_USER;Password=$POSTGRES_PASSWORD;SSL Mode=Prefer;Trust Server Certificate=true;Include Error Detail=true"
az keyvault secret set `
  --vault-name $KEYVAULT_NAME `
  --name "connectionstrings-defaultconnection" `
  --value $defaultConnStr `
  --output none

Write-Host "   ✅ Updated successfully" -ForegroundColor Green

# 5. Add new PostgreSQL-specific secrets
Write-Host "5️⃣  Adding: postgres-password" -ForegroundColor Yellow
az keyvault secret set `
  --vault-name $KEYVAULT_NAME `
  --name "postgres-password" `
  --value $POSTGRES_PASSWORD `
  --output none

Write-Host "   ✅ Added successfully" -ForegroundColor Green

Write-Host ""
Write-Host "✅ All connection strings updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Summary:" -ForegroundColor Cyan
Write-Host "   - connectionstrings-masterconnection"
Write-Host "   - connectionstrings-tenantconnection"
Write-Host "   - connectionstrings-hangfireconnection"
Write-Host "   - connectionstrings-defaultconnection"
Write-Host "   - postgres-password (new)"
Write-Host ""
Write-Host "🔄 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Restart your application to load new connection strings"
Write-Host "   2. Verify database connectivity"
Write-Host "   3. Run migrations if needed"
Write-Host ""
Write-Host "💡 Note: Connection strings will auto-reload in 5 minutes (ReloadInterval)" -ForegroundColor Gray
Write-Host "   Or restart the application for immediate effect" -ForegroundColor Gray
Write-Host ""

#!/bin/bash
# Azure Key Vault PostgreSQL Migration Script
# This script updates all database connection strings to PostgreSQL format

set -e

echo "🔐 Azure Key Vault PostgreSQL Migration Script"
echo "=============================================="

# Configuration
KEYVAULT_NAME="stocker-kv-prod"
POSTGRES_PASSWORD="KMVCh4TrpA6BPS2ZnZWgieqxEcFGXpGK"
POSTGRES_USER="stocker_admin"
POSTGRES_HOST="postgres"  # For Coolify internal network
POSTGRES_PORT="5432"

# For Azure PostgreSQL (if using managed service instead of container)
# POSTGRES_HOST="stocker-pg-prod.postgres.database.azure.com"
# POSTGRES_PORT="5432"
# Add SSL Mode=Require for Azure

echo ""
echo "📋 Configuration:"
echo "  Key Vault: ${KEYVAULT_NAME}"
echo "  PostgreSQL Host: ${POSTGRES_HOST}"
echo "  PostgreSQL User: ${POSTGRES_USER}"
echo "  PostgreSQL Port: ${POSTGRES_PORT}"
echo ""

# Login to Azure (if not already logged in)
echo "🔑 Checking Azure login status..."
az account show > /dev/null 2>&1 || {
    echo "Please login to Azure first:"
    az login
}

# Get current subscription
SUBSCRIPTION=$(az account show --query name -o tsv)
echo "✅ Logged in to Azure"
echo "   Subscription: ${SUBSCRIPTION}"
echo ""

# Update connection strings
echo "🔄 Updating connection strings in Key Vault..."
echo ""

# 1. MasterConnection
echo "1️⃣  Updating: connectionstrings-masterconnection"
az keyvault secret set \
  --vault-name "${KEYVAULT_NAME}" \
  --name "connectionstrings-masterconnection" \
  --value "Host=${POSTGRES_HOST};Port=${POSTGRES_PORT};Database=stocker_master;Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD};SSL Mode=Prefer;Trust Server Certificate=true;Include Error Detail=true" \
  --output none

echo "   ✅ Updated successfully"

# 2. TenantConnection
echo "2️⃣  Updating: connectionstrings-tenantconnection"
az keyvault secret set \
  --vault-name "${KEYVAULT_NAME}" \
  --name "connectionstrings-tenantconnection" \
  --value "Host=${POSTGRES_HOST};Port=${POSTGRES_PORT};Database=stocker_tenant;Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD};SSL Mode=Prefer;Trust Server Certificate=true;Include Error Detail=true" \
  --output none

echo "   ✅ Updated successfully"

# 3. HangfireConnection
echo "3️⃣  Updating: connectionstrings-hangfireconnection"
az keyvault secret set \
  --vault-name "${KEYVAULT_NAME}" \
  --name "connectionstrings-hangfireconnection" \
  --value "Host=${POSTGRES_HOST};Port=${POSTGRES_PORT};Database=stocker_hangfire;Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD};SSL Mode=Prefer;Trust Server Certificate=true;Include Error Detail=true" \
  --output none

echo "   ✅ Updated successfully"

# 4. DefaultConnection
echo "4️⃣  Updating: connectionstrings-defaultconnection"
az keyvault secret set \
  --vault-name "${KEYVAULT_NAME}" \
  --name "connectionstrings-defaultconnection" \
  --value "Host=${POSTGRES_HOST};Port=${POSTGRES_PORT};Database=stocker_tenant;Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD};SSL Mode=Prefer;Trust Server Certificate=true;Include Error Detail=true" \
  --output none

echo "   ✅ Updated successfully"

# 5. Add new PostgreSQL-specific secrets
echo "5️⃣  Adding: postgres-password"
az keyvault secret set \
  --vault-name "${KEYVAULT_NAME}" \
  --name "postgres-password" \
  --value "${POSTGRES_PASSWORD}" \
  --output none

echo "   ✅ Added successfully"

echo ""
echo "✅ All connection strings updated successfully!"
echo ""
echo "📝 Summary:"
echo "   - connectionstrings-masterconnection"
echo "   - connectionstrings-tenantconnection"
echo "   - connectionstrings-hangfireconnection"
echo "   - connectionstrings-defaultconnection"
echo "   - postgres-password (new)"
echo ""
echo "🔄 Next Steps:"
echo "   1. Restart your application to load new connection strings"
echo "   2. Verify database connectivity"
echo "   3. Run migrations if needed"
echo ""
echo "💡 Note: Connection strings will auto-reload in 5 minutes (ReloadInterval)"
echo "   Or restart the application for immediate effect"
echo ""

#!/bin/bash
set -e

echo "🔧 Initializing PostgreSQL databases for Stocker..."

# Create databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create databases
    CREATE DATABASE stocker_master;
    CREATE DATABASE stocker_tenant;
    CREATE DATABASE stocker_hangfire;

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE stocker_master TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE stocker_tenant TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE stocker_hangfire TO $POSTGRES_USER;

    -- Connect to each database and create schemas
    \c stocker_master
    CREATE SCHEMA IF NOT EXISTS master;
    GRANT ALL ON SCHEMA master TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA master TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA master TO $POSTGRES_USER;

    \c stocker_tenant
    CREATE SCHEMA IF NOT EXISTS tenant;
    CREATE SCHEMA IF NOT EXISTS crm;
    GRANT ALL ON SCHEMA tenant TO $POSTGRES_USER;
    GRANT ALL ON SCHEMA crm TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA tenant TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA tenant TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA crm TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA crm TO $POSTGRES_USER;

    \c stocker_hangfire
    CREATE SCHEMA IF NOT EXISTS hangfire;
    GRANT ALL ON SCHEMA hangfire TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hangfire TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hangfire TO $POSTGRES_USER;
EOSQL

echo "✅ PostgreSQL databases and schemas created successfully!"
echo "   - stocker_master (schema: master)"
echo "   - stocker_tenant (schema: tenant, crm)"
echo "   - stocker_hangfire (schema: hangfire)"

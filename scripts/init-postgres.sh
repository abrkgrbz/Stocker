#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create databases
    CREATE DATABASE stocker_master;
    CREATE DATABASE stocker_tenant;
    CREATE DATABASE stocker_hangfire;

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE stocker_master TO stocker_user;
    GRANT ALL PRIVILEGES ON DATABASE stocker_tenant TO stocker_user;
    GRANT ALL PRIVILEGES ON DATABASE stocker_hangfire TO stocker_user;

    -- Connect to each database and create schemas
    \c stocker_master
    CREATE SCHEMA IF NOT EXISTS master;
    GRANT ALL ON SCHEMA master TO stocker_user;

    \c stocker_tenant
    CREATE SCHEMA IF NOT EXISTS tenant;
    CREATE SCHEMA IF NOT EXISTS crm;
    GRANT ALL ON SCHEMA tenant TO stocker_user;
    GRANT ALL ON SCHEMA crm TO stocker_user;

    \c stocker_hangfire
    CREATE SCHEMA IF NOT EXISTS hangfire;
    GRANT ALL ON SCHEMA hangfire TO stocker_user;
EOSQL

echo "PostgreSQL databases and schemas created successfully!"

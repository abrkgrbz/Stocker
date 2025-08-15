-- Initialize Stocker Database Structure

-- Create master database if not exists
SELECT 'CREATE DATABASE stocker_master'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stocker_master')\gexec

-- Create tenant template database
SELECT 'CREATE DATABASE stocker_tenant_template'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stocker_tenant_template')\gexec

-- Create test tenant databases
SELECT 'CREATE DATABASE stocker_tenant_test1'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stocker_tenant_test1')\gexec

SELECT 'CREATE DATABASE stocker_tenant_test2'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stocker_tenant_test2')\gexec

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE stocker_master TO postgres;
GRANT ALL PRIVILEGES ON DATABASE stocker_tenant_template TO postgres;
GRANT ALL PRIVILEGES ON DATABASE stocker_tenant_test1 TO postgres;
GRANT ALL PRIVILEGES ON DATABASE stocker_tenant_test2 TO postgres;

-- Create extensions
\c stocker_master
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c stocker_tenant_template
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
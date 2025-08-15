-- Create master database if not exists
SELECT 'CREATE DATABASE stocker_master'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stocker_master')\gexec

-- Create tenant databases (örnek)
SELECT 'CREATE DATABASE tenant_db_template'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tenant_db_template')\gexec

-- Extensions
\c stocker_master;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
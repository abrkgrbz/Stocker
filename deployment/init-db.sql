-- Initialize Stocker Database
-- This script runs automatically when PostgreSQL container starts

-- Create databases for multi-tenant architecture
CREATE DATABASE stocker_tenant_template;
CREATE DATABASE stocker_tenant_demo;

-- Create extensions in master database
\c stocker_master;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create extensions in template database
\c stocker_tenant_template;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Switch back to master
\c stocker_master;

-- Create initial schema version tracking table
CREATE TABLE IF NOT EXISTS schema_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial version
INSERT INTO schema_versions (version) VALUES ('1.0.0');

-- Grant all privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
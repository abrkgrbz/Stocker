-- MSSQL Initialization Script
-- Create master database if not exists
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'StockerMaster')
BEGIN
    CREATE DATABASE StockerMaster;
END
GO

USE StockerMaster;
GO

-- Create schema if not exists
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'dbo')
BEGIN
    EXEC('CREATE SCHEMA dbo');
END
GO

-- Create tenant database template
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'TenantDbTemplate')
BEGIN
    CREATE DATABASE TenantDbTemplate;
END
GO

-- Enable CDC if needed (optional)
-- EXEC sys.sp_cdc_enable_db;

PRINT 'Database initialization completed successfully';
-- Initialize Stocker Databases
-- Run this script on SQL Server to create required databases

-- Check and create Master Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'StockerMasterDb')
BEGIN
    CREATE DATABASE StockerMasterDb;
    PRINT 'StockerMasterDb created successfully';
END
ELSE
BEGIN
    PRINT 'StockerMasterDb already exists';
END
GO

-- Check and create Tenant Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'StockerTenantDb')
BEGIN
    CREATE DATABASE StockerTenantDb;
    PRINT 'StockerTenantDb created successfully';
END
ELSE
BEGIN
    PRINT 'StockerTenantDb already exists';
END
GO

-- Check and create Hangfire Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'StockerHangfireDb')
BEGIN
    CREATE DATABASE StockerHangfireDb;
    PRINT 'StockerHangfireDb created successfully';
END
ELSE
BEGIN
    PRINT 'StockerHangfireDb already exists';
END
GO

-- Grant permissions to sa user (already has by default)
-- If using a different user, uncomment and modify:
-- USE StockerMasterDb;
-- GO
-- CREATE USER [app_user] FOR LOGIN [app_user];
-- ALTER ROLE db_owner ADD MEMBER [app_user];
-- GO

-- USE StockerTenantDb;
-- GO
-- CREATE USER [app_user] FOR LOGIN [app_user];
-- ALTER ROLE db_owner ADD MEMBER [app_user];
-- GO

-- USE StockerHangfireDb;
-- GO
-- CREATE USER [app_user] FOR LOGIN [app_user];
-- ALTER ROLE db_owner ADD MEMBER [app_user];
-- GO

PRINT 'Database initialization completed!';
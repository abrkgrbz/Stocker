-- Create databases if they don't exist
-- Connect to master database first

-- Create StockerMasterDb
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

-- Create StockerTenantDb
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

-- Create StockerHangfireDb
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

PRINT 'All databases created successfully!';
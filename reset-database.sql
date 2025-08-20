-- WARNING: This script will DROP and RECREATE all databases
-- Run this on your Coolify MSSQL instance

-- Drop existing databases
USE master;
GO

-- Drop StockerMasterDb if exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'StockerMasterDb')
BEGIN
    ALTER DATABASE StockerMasterDb SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE StockerMasterDb;
END
GO

-- Drop all tenant databases
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql = @sql + 'ALTER DATABASE [' + name + '] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [' + name + ']; '
FROM sys.databases 
WHERE name LIKE 'StockerTenant_%';

IF @sql != ''
    EXEC sp_executesql @sql;
GO

-- Create fresh StockerMasterDb
CREATE DATABASE StockerMasterDb;
GO

USE StockerMasterDb;
GO

-- Create schemas
CREATE SCHEMA master;
GO

PRINT 'Databases reset successfully. Please run migrations from the application.';
GO
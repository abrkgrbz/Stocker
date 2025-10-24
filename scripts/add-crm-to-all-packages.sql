-- Add CRM module to all existing packages
-- This script ensures all tenants have access to CRM functionality

USE StockerMasterDb;
GO

-- First, let's see what packages and modules we have
SELECT 'Current Packages:' as Info;
SELECT Id, Name, BasePrice FROM Packages;

SELECT 'Current Package Modules:' as Info;
SELECT pm.PackageId, p.Name as PackageName, pm.ModuleName
FROM PackageModules pm
JOIN Packages p ON pm.PackageId = p.Id
ORDER BY p.Name, pm.ModuleName;

-- Check if CRM module already exists for each package
SELECT 'Packages WITHOUT CRM module:' as Info;
SELECT p.Id, p.Name
FROM Packages p
WHERE NOT EXISTS (
    SELECT 1 FROM PackageModules pm
    WHERE pm.PackageId = p.Id AND pm.ModuleName = 'CRM'
);

-- Add CRM module to all packages that don't have it
INSERT INTO PackageModules (PackageId, ModuleName, IsIncluded, FeatureCode, FeatureName)
SELECT
    p.Id,
    'CRM' as ModuleName,
    1 as IsIncluded,
    'CRM' as FeatureCode,
    'CRM Modülü' as FeatureName
FROM Packages p
WHERE NOT EXISTS (
    SELECT 1 FROM PackageModules pm
    WHERE pm.PackageId = p.Id AND pm.ModuleName = 'CRM'
);

-- Verify the changes
SELECT 'After adding CRM - All Package Modules:' as Info;
SELECT pm.PackageId, p.Name as PackageName, pm.ModuleName
FROM PackageModules pm
JOIN Packages p ON pm.PackageId = p.Id
ORDER BY p.Name, pm.ModuleName;

PRINT 'CRM module has been added to all packages successfully!';

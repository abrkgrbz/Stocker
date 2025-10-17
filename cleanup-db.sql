-- Cleanup Script for Stocker Database
-- This will delete all tenant registrations, tenants, subscriptions, and master users

USE StockerMasterDb;
GO

-- Disable foreign key constraints temporarily
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- Delete in correct order (respecting foreign keys)
DELETE FROM Subscriptions;
DELETE FROM TenantDomains;
DELETE FROM MasterUsers;
DELETE FROM Tenants;
DELETE FROM TenantRegistrations;

-- Re-enable foreign key constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
GO

-- Verify cleanup
SELECT 'TenantRegistrations' as TableName, COUNT(*) as RecordCount FROM TenantRegistrations
UNION ALL
SELECT 'Tenants', COUNT(*) FROM Tenants
UNION ALL
SELECT 'MasterUsers', COUNT(*) FROM MasterUsers
UNION ALL
SELECT 'Subscriptions', COUNT(*) FROM Subscriptions
UNION ALL
SELECT 'TenantDomains', COUNT(*) FROM TenantDomains;
GO

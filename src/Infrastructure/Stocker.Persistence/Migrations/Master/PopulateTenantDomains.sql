-- Populate TenantDomains table for subdomain support
-- This script adds subdomain entries for existing tenants

-- Check if TenantDomains table exists
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'TenantDomains')
BEGIN
    -- Add subdomain for ABG Teknoloji tenant
    IF EXISTS (SELECT 1 FROM dbo.Tenants WHERE Identifier = 'ABGTeknoloji')
    BEGIN
        DECLARE @ABGTenantId UNIQUEIDENTIFIER
        SELECT @ABGTenantId = Id FROM dbo.Tenants WHERE Identifier = 'ABGTeknoloji'
        
        -- Check if domain already exists
        IF NOT EXISTS (SELECT 1 FROM dbo.TenantDomains WHERE DomainName = 'abg-teknoloji.stoocker.app' AND TenantId = @ABGTenantId)
        BEGIN
            INSERT INTO dbo.TenantDomains (Id, TenantId, DomainName, IsActive, IsPrimary, CreatedDate, CreatedBy)
            VALUES (
                NEWID(),
                @ABGTenantId,
                'abg-teknoloji.stoocker.app',
                1, -- IsActive
                1, -- IsPrimary
                GETDATE(),
                'System'
            )
        END
    END

    -- Add subdomain for Demo tenant
    IF EXISTS (SELECT 1 FROM dbo.Tenants WHERE Identifier = 'Demo' OR Name LIKE '%Demo%')
    BEGIN
        DECLARE @DemoTenantId UNIQUEIDENTIFIER
        SELECT TOP 1 @DemoTenantId = Id FROM dbo.Tenants WHERE Identifier = 'Demo' OR Name LIKE '%Demo%'
        
        IF NOT EXISTS (SELECT 1 FROM dbo.TenantDomains WHERE DomainName = 'demo.stoocker.app' AND TenantId = @DemoTenantId)
        BEGIN
            INSERT INTO dbo.TenantDomains (Id, TenantId, DomainName, IsActive, IsPrimary, CreatedDate, CreatedBy)
            VALUES (
                NEWID(),
                @DemoTenantId,
                'demo.stoocker.app',
                1, -- IsActive
                1, -- IsPrimary
                GETDATE(),
                'System'
            )
        END
    END

    -- Add subdomain for Test tenant
    IF EXISTS (SELECT 1 FROM dbo.Tenants WHERE Identifier = 'Test' OR Name LIKE '%Test%')
    BEGIN
        DECLARE @TestTenantId UNIQUEIDENTIFIER
        SELECT TOP 1 @TestTenantId = Id FROM dbo.Tenants WHERE Identifier = 'Test' OR Name LIKE '%Test%'
        
        IF NOT EXISTS (SELECT 1 FROM dbo.TenantDomains WHERE DomainName = 'test.stoocker.app' AND TenantId = @TestTenantId)
        BEGIN
            INSERT INTO dbo.TenantDomains (Id, TenantId, DomainName, IsActive, IsPrimary, CreatedDate, CreatedBy)
            VALUES (
                NEWID(),
                @TestTenantId,
                'test.stoocker.app',
                1, -- IsActive
                1, -- IsPrimary
                GETDATE(),
                'System'
            )
        END
    END

    -- Add subdomains for all other active tenants (if they don't have one)
    INSERT INTO dbo.TenantDomains (Id, TenantId, DomainName, IsActive, IsPrimary, CreatedDate, CreatedBy)
    SELECT 
        NEWID() as Id,
        t.Id as TenantId,
        CONCAT(LOWER(REPLACE(t.Identifier, ' ', '-')), '.stoocker.app') as DomainName,
        1 as IsActive,
        1 as IsPrimary,
        GETDATE() as CreatedDate,
        'System' as CreatedBy
    FROM dbo.Tenants t
    WHERE t.IsActive = 1
        AND NOT EXISTS (
            SELECT 1 
            FROM dbo.TenantDomains td 
            WHERE td.TenantId = t.Id 
                AND td.DomainName LIKE '%.stoocker.app'
        )
        
    PRINT 'TenantDomains table populated successfully'
END
ELSE
BEGIN
    PRINT 'TenantDomains table does not exist'
END
-- Add Slug column to Tenants table if it doesn't exist
IF NOT EXISTS (
    SELECT * 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.Tenants') 
    AND name = 'Slug'
)
BEGIN
    ALTER TABLE dbo.Tenants
    ADD Slug NVARCHAR(100) NULL;
    
    -- Update existing records to use Identifier as Slug
    UPDATE dbo.Tenants
    SET Slug = LOWER(REPLACE(Identifier, ' ', '-'))
    WHERE Slug IS NULL;
    
    -- Create index for better performance
    CREATE INDEX IX_Tenants_Slug ON dbo.Tenants(Slug);
END

-- Check if Domain column exists (it should, but let's make sure it has correct values)
IF EXISTS (
    SELECT * 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.Tenants') 
    AND name = 'Domain'
)
BEGIN
    -- Update Domain values for existing tenants based on their Slug
    UPDATE dbo.Tenants
    SET Domain = CONCAT(LOWER(REPLACE(Identifier, ' ', '-')), '.stoocker.app')
    WHERE Domain IS NULL OR Domain = '';
    
    -- Update specific tenant with correct domain
    UPDATE dbo.Tenants
    SET Domain = 'abg-teknoloji.stoocker.app',
        Slug = 'abg-teknoloji'
    WHERE Identifier = 'ABGTeknoloji';
END

-- Sample tenants with proper domains
UPDATE dbo.Tenants
SET Slug = 'demo', Domain = 'demo.stoocker.app'
WHERE Identifier = 'Demo' OR Name LIKE '%Demo%';

UPDATE dbo.Tenants
SET Slug = 'test', Domain = 'test.stoocker.app'
WHERE Identifier = 'Test' OR Name LIKE '%Test%';
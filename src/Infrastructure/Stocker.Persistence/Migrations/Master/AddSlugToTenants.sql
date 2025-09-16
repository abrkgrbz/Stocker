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

-- Update sample tenant if exists
UPDATE dbo.Tenants
SET Slug = 'abg-teknoloji'
WHERE Identifier = 'ABGTeknoloji' AND Slug IS NULL;
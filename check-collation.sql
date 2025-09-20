-- Check database collation
SELECT 
    name AS DatabaseName,
    collation_name AS DatabaseCollation
FROM sys.databases
WHERE name IN ('StockerMasterDb', 'StockerTenantDb');

-- Check table collation for Packages table
USE StockerMasterDb;
GO

SELECT 
    c.name AS ColumnName,
    c.collation_name AS ColumnCollation,
    t.name AS DataType,
    c.max_length,
    c.is_nullable
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('master.Packages')
AND c.collation_name IS NOT NULL
ORDER BY c.column_id;

-- Check current data in Packages table
SELECT TOP 5
    Id,
    Name,
    Description,
    CAST(Name AS VARBINARY(MAX)) AS NameBytes,
    CAST(Description AS VARBINARY(MAX)) AS DescriptionBytes
FROM master.Packages;
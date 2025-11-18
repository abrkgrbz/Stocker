-- Basit Tenant Durumu Kontrolü

USE StockerMasterDb;
GO

PRINT '========================================';
PRINT 'SON KULLANICI';
PRINT '========================================';

SELECT TOP 1
    mu.Email,
    mu.FirstName + ' ' + mu.LastName as [Ad Soyad],
    mu.IsEmailVerified as [Email OK],
    mu.IsActive as [Aktif],
    mu.CreatedAt as [Kayit]
FROM MasterUsers mu
ORDER BY mu.CreatedAt DESC;

PRINT '';
PRINT '========================================';
PRINT 'SON TENANT';
PRINT '========================================';

SELECT TOP 1
    t.Id as [Tenant ID],
    t.Name as [Ad],
    t.Subdomain,
    t.IsActive as [Aktif],
    t.ProvisioningStatus as [Provisioning],
    t.CreatedAt as [Olusturma]
FROM Tenants t
ORDER BY t.CreatedAt DESC;

PRINT '';
PRINT '========================================';
PRINT 'TENANT DATABASE CHECK';
PRINT '========================================';

DECLARE @TenantId UNIQUEIDENTIFIER;
DECLARE @DatabaseName NVARCHAR(255);

SELECT TOP 1
    @TenantId = t.Id,
    @DatabaseName = 'Stocker_' + CAST(t.Id AS NVARCHAR(36))
FROM Tenants t
ORDER BY t.CreatedAt DESC;

IF EXISTS (SELECT 1 FROM sys.databases WHERE name = @DatabaseName)
    PRINT 'DATABASE MEVCUT: ' + @DatabaseName;
ELSE
    PRINT 'DATABASE YOK: ' + @DatabaseName;

GO

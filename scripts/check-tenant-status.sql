-- Tenant Provisioning Durumunu Kontrol Etme
-- Son kayıt olan kullanıcı ve tenant bilgilerini göster

USE StockerMasterDb;
GO

PRINT '========================================';
PRINT 'SON KAYIT OLAN KULLANICI ve TENANT';
PRINT '========================================';
PRINT '';

-- Son kayıt olan kullanıcı
SELECT TOP 1
    'KULLANICI BILGILERI' as [Tip],
    mu.Id as [User ID],
    mu.Email,
    mu.FirstName + ' ' + mu.LastName as [Ad Soyad],
    mu.IsEmailVerified as [Email Dogrulandi],
    mu.IsActive as [Aktif],
    mu.CreatedAt as [Kayit Tarihi]
FROM MasterUsers mu
ORDER BY mu.CreatedAt DESC;

PRINT '';
PRINT '========================================';

-- Son oluşturulan tenant
SELECT TOP 1
    'TENANT BILGILERI' as [Tip],
    t.Id as [Tenant ID],
    t.Name as [Tenant Adi],
    t.Subdomain,
    t.IsActive as [Aktif],
    t.ProvisioningStatus as [Provisioning Durumu],
    t.ProvisioningCompletedAt as [Provisioning Tamamlanma],
    t.CreatedAt as [Olusturma Tarihi]
FROM Tenants t
ORDER BY t.CreatedAt DESC;

PRINT '';
PRINT '========================================';
PRINT 'TENANT VERITABANI KONTROL';
PRINT '========================================';

-- Tenant veritabanının var olup olmadığını kontrol et
DECLARE @TenantId UNIQUEIDENTIFIER;
DECLARE @DatabaseName NVARCHAR(255);

SELECT TOP 1
    @TenantId = t.Id,
    @DatabaseName = 'Stocker_' + CAST(t.Id AS NVARCHAR(36))
FROM Tenants t
ORDER BY t.CreatedAt DESC;

IF EXISTS (SELECT 1 FROM sys.databases WHERE name = @DatabaseName)
BEGIN
    PRINT 'TENANT VERITABANI MEVCUT: ' + @DatabaseName;

    -- Veritabanı boyutu
    DECLARE @sql NVARCHAR(MAX) = N'
        USE [' + @DatabaseName + N'];
        SELECT
            DB_NAME() as [Veritabani],
            (SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0) as [Tablo Sayisi],
            (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = ''BASE TABLE'') as [User Tablo Sayisi]';

    EXEC sp_executesql @sql;
END
ELSE
BEGIN
    PRINT 'TENANT VERITABANI BULUNAMADI: ' + @DatabaseName;
    PRINT 'Provisioning henüz tamamlanmamış olabilir!';
END

PRINT '';
PRINT '========================================';
PRINT 'HANGFIRE JOB DURUMU (Son 10 Job)';
PRINT '========================================';

USE StockerHangfireDb;
GO

-- Hangfire job durumu
SELECT TOP 10
    j.Id as [Job ID],
    j.InvocationData,
    j.CreatedAt as [Olusturma],
    s.Name as [Durum],
    s.CreatedAt as [Durum Zamani],
    s.Reason as [Sebep]
FROM [HangFire].[Job] j
LEFT JOIN [HangFire].[State] s ON j.StateId = s.Id
WHERE j.InvocationData LIKE '%ProvisionNewTenantAsync%'
   OR j.InvocationData LIKE '%TenantProvisioningJob%'
ORDER BY j.CreatedAt DESC;

PRINT '';
PRINT '========================================';
PRINT 'BAŞARISIZ JOBLAR (Son 5)';
PRINT '========================================';

SELECT TOP 5
    j.Id as [Job ID],
    j.InvocationData,
    j.CreatedAt as [Olusturma],
    s.Name as [Durum],
    s.Reason as [Hata Mesaji],
    s.CreatedAt as [Hata Zamani]
FROM [HangFire].[Job] j
INNER JOIN [HangFire].[State] s ON j.StateId = s.Id
WHERE s.Name = 'Failed'
ORDER BY j.CreatedAt DESC;

GO

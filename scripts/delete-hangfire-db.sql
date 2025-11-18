-- StockerHangfireDb Veritabanını Silme Script'i
-- Önce MULTI_USER'a al, sonra tüm bağlantıları kapat ve sil

USE master;
GO

-- 1. Önce MULTI_USER moduna al (eğer SINGLE_USER'daysa)
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'StockerHangfireDb' AND user_access = 1)
BEGIN
    PRINT 'Veritabanı SINGLE_USER modunda, MULTI_USER''a alınıyor...';
    ALTER DATABASE StockerHangfireDb SET MULTI_USER WITH ROLLBACK IMMEDIATE;
    PRINT 'MULTI_USER moduna alındı.';
END
GO

-- 2. Aktif bağlantıları kontrol et
PRINT 'Aktif bağlantılar kontrol ediliyor...';
SELECT
    session_id,
    login_name,
    host_name,
    program_name,
    status
FROM sys.dm_exec_sessions
WHERE database_id = DB_ID('StockerHangfireDb');
GO

-- 3. Tüm aktif bağlantıları kapat
DECLARE @kill varchar(8000) = '';
SELECT @kill = @kill + 'KILL ' + CONVERT(varchar(5), session_id) + ';'
FROM sys.dm_exec_sessions
WHERE database_id = DB_ID('StockerHangfireDb')
  AND session_id <> @@SPID;

IF @kill <> ''
BEGIN
    PRINT 'Aktif bağlantılar kapatılıyor: ' + @kill;
    EXEC(@kill);
    PRINT 'Tüm bağlantılar kapatıldı.';
END
ELSE
BEGIN
    PRINT 'Kapatılacak aktif bağlantı yok.';
END
GO

-- 4. Veritabanını sil
PRINT 'Veritabanı siliniyor...';
DROP DATABASE StockerHangfireDb;
PRINT 'StockerHangfireDb veritabanı başarıyla silindi!';
GO

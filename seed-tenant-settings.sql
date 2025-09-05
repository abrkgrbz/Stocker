-- Seed data for TenantSettings table
-- For tenant: ABG Teknoloji (25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8)

USE [Stocker_Tenant_abg-teknoloji];
GO

-- Clear existing settings for this tenant (if any exist)
DELETE FROM [tenant].[TenantSettings] WHERE TenantId = '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8';
GO

-- Insert General Settings
INSERT INTO [tenant].[TenantSettings] (Id, TenantId, SettingKey, SettingValue, Description, Category, DataType, IsSystemSetting, IsEncrypted, IsPublic, CreatedAt, UpdatedAt)
VALUES 
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'company.name', 'ABG Teknoloji A.Ş.', 'Şirket adınız', 'Genel', 'string', 0, 0, 1, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'company.address', 'İstanbul, Türkiye', 'Şirket adresiniz', 'Genel', 'string', 0, 0, 1, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'company.phone', '+90 532 078 2250', 'İletişim telefonu', 'Genel', 'string', 0, 0, 1, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'company.email', 'anilberk1997@hotmail.com', 'İletişim e-posta adresi', 'Genel', 'string', 0, 0, 1, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'company.website', 'https://www.abgteknoloji.com', 'Web sitesi adresi', 'Genel', 'string', 0, 0, 1, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'company.taxNumber', '1234567890', 'Vergi numarası', 'Genel', 'string', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'company.taxOffice', 'Kadıköy Vergi Dairesi', 'Vergi dairesi', 'Genel', 'string', 0, 0, 0, GETDATE(), NULL);

-- Insert Invoice Settings
INSERT INTO [tenant].[TenantSettings] (Id, TenantId, SettingKey, SettingValue, Description, Category, DataType, IsSystemSetting, IsEncrypted, IsPublic, CreatedAt, UpdatedAt)
VALUES 
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'invoice.prefix', 'ABG', 'Fatura numarası öneki', 'Fatura', 'string', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'invoice.startNumber', '1000', 'Başlangıç fatura numarası', 'Fatura', 'number', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'invoice.taxRate', '20', 'Varsayılan KDV oranı (%)', 'Fatura', 'number', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'invoice.currency', 'TRY', 'Para birimi', 'Fatura', 'string', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'invoice.paymentTerms', '30', 'Ödeme vadesi (gün)', 'Fatura', 'number', 0, 0, 0, GETDATE(), NULL);

-- Insert Email Settings
INSERT INTO [tenant].[TenantSettings] (Id, TenantId, SettingKey, SettingValue, Description, Category, DataType, IsSystemSetting, IsEncrypted, IsPublic, CreatedAt, UpdatedAt)
VALUES 
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'email.smtpHost', 'smtp.gmail.com', 'SMTP sunucu adresi', 'E-posta', 'string', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'email.smtpPort', '587', 'SMTP port numarası', 'E-posta', 'number', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'email.smtpUser', 'noreply@abgteknoloji.com', 'SMTP kullanıcı adı', 'E-posta', 'string', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'email.smtpPassword', '', 'SMTP şifresi', 'E-posta', 'string', 0, 1, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'email.enableSsl', 'true', 'SSL kullan', 'E-posta', 'boolean', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'email.fromAddress', 'noreply@abgteknoloji.com', 'Gönderen e-posta adresi', 'E-posta', 'string', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'email.fromName', 'ABG Teknoloji', 'Gönderen adı', 'E-posta', 'string', 0, 0, 0, GETDATE(), NULL);

-- Insert Security Settings
INSERT INTO [tenant].[TenantSettings] (Id, TenantId, SettingKey, SettingValue, Description, Category, DataType, IsSystemSetting, IsEncrypted, IsPublic, CreatedAt, UpdatedAt)
VALUES 
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'security.passwordMinLength', '8', 'Minimum şifre uzunluğu', 'Güvenlik', 'number', 1, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'security.passwordRequireUppercase', 'true', 'Büyük harf zorunlu', 'Güvenlik', 'boolean', 1, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'security.passwordRequireLowercase', 'true', 'Küçük harf zorunlu', 'Güvenlik', 'boolean', 1, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'security.passwordRequireDigit', 'true', 'Rakam zorunlu', 'Güvenlik', 'boolean', 1, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'security.passwordRequireSpecialChar', 'false', 'Özel karakter zorunlu', 'Güvenlik', 'boolean', 1, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'security.sessionTimeout', '30', 'Oturum zaman aşımı (dakika)', 'Güvenlik', 'number', 1, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'security.maxLoginAttempts', '5', 'Maksimum giriş denemesi', 'Güvenlik', 'number', 1, 0, 0, GETDATE(), NULL);

-- Insert Localization Settings
INSERT INTO [tenant].[TenantSettings] (Id, TenantId, SettingKey, SettingValue, Description, Category, DataType, IsSystemSetting, IsEncrypted, IsPublic, CreatedAt, UpdatedAt)
VALUES 
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'localization.defaultLanguage', 'tr-TR', 'Varsayılan dil', 'Yerelleştirme', 'string', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'localization.timezone', 'Europe/Istanbul', 'Saat dilimi', 'Yerelleştirme', 'string', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'localization.dateFormat', 'DD.MM.YYYY', 'Tarih formatı', 'Yerelleştirme', 'string', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'localization.timeFormat', 'HH:mm', 'Saat formatı', 'Yerelleştirme', 'string', 0, 0, 0, GETDATE(), NULL),
    (NEWID(), '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8', 'localization.firstDayOfWeek', '1', 'Haftanın ilk günü (1=Pazartesi)', 'Yerelleştirme', 'number', 0, 0, 0, GETDATE(), NULL);

-- Verify the data was inserted
SELECT COUNT(*) AS TotalSettings FROM [tenant].[TenantSettings] WHERE TenantId = '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8';
SELECT Category, COUNT(*) AS Count FROM [tenant].[TenantSettings] WHERE TenantId = '25AB3FBA-1D66-4A60-B3B4-2A8D4590AEC8' GROUP BY Category;

PRINT 'Tenant settings seed data created successfully!'
GO
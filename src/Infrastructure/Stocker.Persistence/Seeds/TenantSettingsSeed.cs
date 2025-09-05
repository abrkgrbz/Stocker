using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Tenant.Entities;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Seeds;

public class TenantSettingsSeed
{
    private readonly TenantDbContext _context;
    private readonly ILogger<TenantSettingsSeed> _logger;

    public TenantSettingsSeed(TenantDbContext context, ILogger<TenantSettingsSeed> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync(Guid tenantId)
    {
        try
        {
            // Check if settings already exist
            var existingSettings = await _context.TenantSettings
                .Where(s => s.TenantId == tenantId)
                .AnyAsync();

            if (existingSettings)
            {
                _logger.LogInformation("Settings already exist for tenant {TenantId}", tenantId);
                return;
            }

            var settings = new List<TenantSettings>
            {
                // Genel Ayarlar
                TenantSettings.Create(
                    tenantId,
                    "company.name",
                    "Şirket Adı",
                    "Genel",
                    "string",
                    "Şirket adınız",
                    false,
                    false,
                    true
                ),
                TenantSettings.Create(
                    tenantId,
                    "company.address",
                    "Şirket Adresi",
                    "Genel",
                    "string",
                    "Şirket adresiniz",
                    false,
                    false,
                    true
                ),
                TenantSettings.Create(
                    tenantId,
                    "company.phone",
                    "+90 555 123 4567",
                    "Genel",
                    "string",
                    "İletişim telefonu",
                    false,
                    false,
                    true
                ),
                TenantSettings.Create(
                    tenantId,
                    "company.email",
                    "info@sirket.com",
                    "Genel",
                    "string",
                    "İletişim e-posta adresi",
                    false,
                    false,
                    true
                ),
                TenantSettings.Create(
                    tenantId,
                    "company.website",
                    "https://www.sirket.com",
                    "Genel",
                    "string",
                    "Web sitesi adresi",
                    false,
                    false,
                    true
                ),
                TenantSettings.Create(
                    tenantId,
                    "company.taxNumber",
                    "1234567890",
                    "Genel",
                    "string",
                    "Vergi numarası",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "company.taxOffice",
                    "Vergi Dairesi",
                    "Genel",
                    "string",
                    "Vergi dairesi",
                    false,
                    false,
                    false
                ),

                // Fatura Ayarları
                TenantSettings.Create(
                    tenantId,
                    "invoice.prefix",
                    "INV",
                    "Fatura",
                    "string",
                    "Fatura numarası öneki",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "invoice.startNumber",
                    "1000",
                    "Fatura",
                    "number",
                    "Başlangıç fatura numarası",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "invoice.taxRate",
                    "18",
                    "Fatura",
                    "number",
                    "Varsayılan KDV oranı (%)",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "invoice.currency",
                    "TRY",
                    "Fatura",
                    "string",
                    "Para birimi",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "invoice.paymentTerms",
                    "30",
                    "Fatura",
                    "number",
                    "Ödeme vadesi (gün)",
                    false,
                    false,
                    false
                ),

                // E-posta Ayarları
                TenantSettings.Create(
                    tenantId,
                    "email.smtpHost",
                    "smtp.gmail.com",
                    "E-posta",
                    "string",
                    "SMTP sunucu adresi",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "email.smtpPort",
                    "587",
                    "E-posta",
                    "number",
                    "SMTP port numarası",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "email.smtpUser",
                    "noreply@sirket.com",
                    "E-posta",
                    "string",
                    "SMTP kullanıcı adı",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "email.smtpPassword",
                    "",
                    "E-posta",
                    "string",
                    "SMTP şifresi",
                    false,
                    true,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "email.enableSsl",
                    "true",
                    "E-posta",
                    "boolean",
                    "SSL kullan",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "email.fromAddress",
                    "noreply@sirket.com",
                    "E-posta",
                    "string",
                    "Gönderen e-posta adresi",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "email.fromName",
                    "Şirket Adı",
                    "E-posta",
                    "string",
                    "Gönderen adı",
                    false,
                    false,
                    false
                ),

                // Güvenlik Ayarları
                TenantSettings.Create(
                    tenantId,
                    "security.passwordMinLength",
                    "8",
                    "Güvenlik",
                    "number",
                    "Minimum şifre uzunluğu",
                    true,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "security.passwordRequireUppercase",
                    "true",
                    "Güvenlik",
                    "boolean",
                    "Büyük harf zorunlu",
                    true,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "security.passwordRequireLowercase",
                    "true",
                    "Güvenlik",
                    "boolean",
                    "Küçük harf zorunlu",
                    true,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "security.passwordRequireDigit",
                    "true",
                    "Güvenlik",
                    "boolean",
                    "Rakam zorunlu",
                    true,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "security.passwordRequireSpecialChar",
                    "false",
                    "Güvenlik",
                    "boolean",
                    "Özel karakter zorunlu",
                    true,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "security.sessionTimeout",
                    "30",
                    "Güvenlik",
                    "number",
                    "Oturum zaman aşımı (dakika)",
                    true,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "security.maxLoginAttempts",
                    "5",
                    "Güvenlik",
                    "number",
                    "Maksimum giriş denemesi",
                    true,
                    false,
                    false
                ),

                // Yerelleştirme Ayarları
                TenantSettings.Create(
                    tenantId,
                    "localization.defaultLanguage",
                    "tr-TR",
                    "Yerelleştirme",
                    "string",
                    "Varsayılan dil",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "localization.timezone",
                    "Europe/Istanbul",
                    "Yerelleştirme",
                    "string",
                    "Saat dilimi",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "localization.dateFormat",
                    "DD.MM.YYYY",
                    "Yerelleştirme",
                    "string",
                    "Tarih formatı",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "localization.timeFormat",
                    "HH:mm",
                    "Yerelleştirme",
                    "string",
                    "Saat formatı",
                    false,
                    false,
                    false
                ),
                TenantSettings.Create(
                    tenantId,
                    "localization.firstDayOfWeek",
                    "1",
                    "Yerelleştirme",
                    "number",
                    "Haftanın ilk günü (1=Pazartesi)",
                    false,
                    false,
                    false
                )
            };

            await _context.TenantSettings.AddRangeAsync(settings);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully seeded {Count} settings for tenant {TenantId}", 
                settings.Count, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding settings for tenant {TenantId}", tenantId);
            throw;
        }
    }
}
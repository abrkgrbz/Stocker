using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Settings;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;
using Stocker.Persistence.Contexts;
using System.Text.Json;

namespace Stocker.Persistence.Repositories;

public class SettingsRepository : ISettingsRepository
{
    private readonly TenantDbContext _tenantContext;
    private readonly MasterDbContext _masterContext;

    public SettingsRepository(TenantDbContext tenantContext, MasterDbContext masterContext)
    {
        _tenantContext = tenantContext;
        _masterContext = masterContext;
    }

    // Tenant Settings Implementation
    public async Task<List<TenantSettings>> GetTenantSettingsAsync(Guid tenantId, string? category = null, CancellationToken cancellationToken = default)
    {
        var query = _tenantContext.TenantSettings
            .Where(s => s.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(s => s.Category == category);
        }

        return await query.OrderBy(s => s.Category).ThenBy(s => s.SettingKey).ToListAsync(cancellationToken);
    }

    public async Task<TenantSettings?> GetTenantSettingByKeyAsync(Guid tenantId, string key, CancellationToken cancellationToken = default)
    {
        return await _tenantContext.TenantSettings
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.SettingKey == key, cancellationToken);
    }

    public async Task<TenantSettings> CreateTenantSettingAsync(TenantSettings setting, CancellationToken cancellationToken = default)
    {
        // TenantSettings is created through factory method
        _tenantContext.TenantSettings.Add(setting);
        await _tenantContext.SaveChangesAsync(cancellationToken);
        return setting;
    }

    public async Task<TenantSettings?> UpdateTenantSettingAsync(Guid tenantId, string key, string value, CancellationToken cancellationToken = default)
    {
        var setting = await _tenantContext.TenantSettings
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.SettingKey == key, cancellationToken);

        if (setting == null)
            return null;

        setting.UpdateValue(value);

        await _tenantContext.SaveChangesAsync(cancellationToken);
        return setting;
    }

    public async Task<bool> DeleteTenantSettingAsync(Guid tenantId, string key, CancellationToken cancellationToken = default)
    {
        var setting = await _tenantContext.TenantSettings
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.SettingKey == key, cancellationToken);

        if (setting == null)
            return false;

        _tenantContext.TenantSettings.Remove(setting);
        await _tenantContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<List<SettingCategoryDto>> GetGroupedSettingsAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var settings = await GetTenantSettingsAsync(tenantId, null, cancellationToken);
        
        var grouped = settings
            .GroupBy(s => s.Category ?? "General")
            .Select(g => new SettingCategoryDto
            {
                Category = g.Key,
                Description = GetCategoryDescription(g.Key),
                Settings = g.Select(s => new SettingDto
                {
                    Id = s.Id,
                    SettingKey = s.SettingKey,
                    SettingValue = s.SettingValue,
                    Description = s.Description,
                    Category = s.Category,
                    DataType = s.DataType ?? "string",
                    IsSystemSetting = s.IsSystemSetting,
                    IsEncrypted = s.IsEncrypted,
                    IsPublic = s.IsPublic,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                }).ToList()
            })
            .ToList();

        return grouped;
    }

    public async Task<bool> BulkUpdateSettingsAsync(Guid tenantId, Dictionary<string, string> settings, CancellationToken cancellationToken = default)
    {
        foreach (var kvp in settings)
        {
            var setting = await _tenantContext.TenantSettings
                .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.SettingKey == kvp.Key, cancellationToken);

            if (setting != null)
            {
                setting.UpdateValue(kvp.Value);
            }
            else
            {
                // Create new setting if it doesn't exist
                setting = TenantSettings.Create(
                    tenantId,
                    kvp.Key,
                    kvp.Value,
                    DetermineCategory(kvp.Key),
                    DetermineDataType(kvp.Value)
                );
                _tenantContext.TenantSettings.Add(setting);
            }
        }

        await _tenantContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    // Tenant Modules Implementation
    public async Task<List<TenantModules>> GetTenantModulesAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _tenantContext.TenantModules
            .Where(m => m.TenantId == tenantId)
            .OrderBy(m => m.ModuleName)
            .ToListAsync(cancellationToken);
    }

    public async Task<TenantModules?> GetTenantModuleAsync(Guid tenantId, string moduleCode, CancellationToken cancellationToken = default)
    {
        return await _tenantContext.TenantModules
            .FirstOrDefaultAsync(m => m.TenantId == tenantId && m.ModuleCode == moduleCode, cancellationToken);
    }

    public async Task<bool> ToggleModuleAsync(Guid tenantId, string moduleCode, CancellationToken cancellationToken = default)
    {
        var module = await _tenantContext.TenantModules
            .FirstOrDefaultAsync(m => m.TenantId == tenantId && m.ModuleCode == moduleCode, cancellationToken);

        if (module == null)
            return false;

        if (module.IsEnabled)
            module.Disable();
        else
            module.Enable();

        await _tenantContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> UpdateModuleSettingsAsync(Guid tenantId, string moduleCode, string settings, CancellationToken cancellationToken = default)
    {
        var module = await _tenantContext.TenantModules
            .FirstOrDefaultAsync(m => m.TenantId == tenantId && m.ModuleCode == moduleCode, cancellationToken);

        if (module == null)
            return false;

        module.UpdateConfiguration(settings);

        await _tenantContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    // Master/System Settings Implementation
    public async Task<object> GetSystemSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _masterContext.SystemSettings
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Key)
            .ToListAsync(cancellationToken);

        var grouped = settings
            .GroupBy(s => s.Category ?? "General")
            .Select(g => new
            {
                category = g.Key,
                settings = g.Select(s => new
                {
                    key = s.Key,
                    value = s.Value,
                    description = s.Description,
                    dataType = s.DataType,
                    isRequired = false,
                    lastModified = DateTime.MinValue
                })
            });

        return grouped;
    }

    public async Task<bool> UpdateSystemSettingAsync(string key, string value, CancellationToken cancellationToken = default)
    {
        var setting = await _masterContext.SystemSettings
            .FirstOrDefaultAsync(s => s.Key == key, cancellationToken);

        if (setting == null)
        {
            // Create new setting
            setting = new Domain.Entities.Settings.SystemSettings(
                DetermineCategory(key),
                key,
                value,
                null,
                false,
                false
            );
            _masterContext.SystemSettings.Add(setting);
        }
        else
        {
            setting.UpdateValue(value);
        }

        await _masterContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<object> GetEmailSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _masterContext.SystemSettings
            .Where(s => s.Category == "Email" || s.Key.StartsWith("Email.") || s.Key.StartsWith("Smtp."))
            .ToListAsync(cancellationToken);

        return new
        {
            smtpHost = settings.FirstOrDefault(s => s.Key == "Smtp.Host")?.Value ?? "smtp.gmail.com",
            smtpPort = int.Parse(settings.FirstOrDefault(s => s.Key == "Smtp.Port")?.Value ?? "587"),
            smtpUsername = settings.FirstOrDefault(s => s.Key == "Smtp.Username")?.Value,
            smtpPassword = settings.FirstOrDefault(s => s.Key == "Smtp.Password")?.Value != null ? "********" : null,
            enableSsl = bool.Parse(settings.FirstOrDefault(s => s.Key == "Smtp.EnableSsl")?.Value ?? "true"),
            fromEmail = settings.FirstOrDefault(s => s.Key == "Email.FromAddress")?.Value ?? "noreply@stocker.com",
            fromName = settings.FirstOrDefault(s => s.Key == "Email.FromName")?.Value ?? "Stocker System"
        };
    }

    public async Task<object> GetSecuritySettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _masterContext.SystemSettings
            .Where(s => s.Category == "Security" || s.Key.StartsWith("Security.") || s.Key.StartsWith("Auth."))
            .ToListAsync(cancellationToken);

        return new
        {
            passwordMinLength = int.Parse(settings.FirstOrDefault(s => s.Key == "Security.PasswordMinLength")?.Value ?? "8"),
            passwordRequireUppercase = bool.Parse(settings.FirstOrDefault(s => s.Key == "Security.PasswordRequireUppercase")?.Value ?? "true"),
            passwordRequireLowercase = bool.Parse(settings.FirstOrDefault(s => s.Key == "Security.PasswordRequireLowercase")?.Value ?? "true"),
            passwordRequireDigit = bool.Parse(settings.FirstOrDefault(s => s.Key == "Security.PasswordRequireDigit")?.Value ?? "true"),
            passwordRequireSpecialChar = bool.Parse(settings.FirstOrDefault(s => s.Key == "Security.PasswordRequireSpecialChar")?.Value ?? "true"),
            maxLoginAttempts = int.Parse(settings.FirstOrDefault(s => s.Key == "Security.MaxLoginAttempts")?.Value ?? "5"),
            lockoutDuration = int.Parse(settings.FirstOrDefault(s => s.Key == "Security.LockoutDurationMinutes")?.Value ?? "15"),
            sessionTimeout = int.Parse(settings.FirstOrDefault(s => s.Key == "Security.SessionTimeoutMinutes")?.Value ?? "30"),
            enableTwoFactor = bool.Parse(settings.FirstOrDefault(s => s.Key == "Security.EnableTwoFactor")?.Value ?? "false"),
            jwtExpirationMinutes = int.Parse(settings.FirstOrDefault(s => s.Key == "Auth.JwtExpirationMinutes")?.Value ?? "60")
        };
    }

    public async Task<object> GetGeneralSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _masterContext.SystemSettings
            .Where(s => s.Category == "General" || s.Category == null)
            .ToListAsync(cancellationToken);

        return new
        {
            appName = settings.FirstOrDefault(s => s.Key == "App.Name")?.Value ?? "Stocker",
            appVersion = settings.FirstOrDefault(s => s.Key == "App.Version")?.Value ?? "1.0.0",
            appUrl = settings.FirstOrDefault(s => s.Key == "App.Url")?.Value ?? "https://stocker.com",
            supportEmail = settings.FirstOrDefault(s => s.Key == "Support.Email")?.Value ?? "support@stocker.com",
            supportPhone = settings.FirstOrDefault(s => s.Key == "Support.Phone")?.Value,
            defaultLanguage = settings.FirstOrDefault(s => s.Key == "App.DefaultLanguage")?.Value ?? "tr",
            defaultTimezone = settings.FirstOrDefault(s => s.Key == "App.DefaultTimezone")?.Value ?? "Europe/Istanbul",
            maintenanceMode = bool.Parse(settings.FirstOrDefault(s => s.Key == "App.MaintenanceMode")?.Value ?? "false"),
            allowRegistration = bool.Parse(settings.FirstOrDefault(s => s.Key == "App.AllowRegistration")?.Value ?? "true")
        };
    }

    // Helper methods
    private string GetCategoryDisplayName(string category)
    {
        return category switch
        {
            "General" => "Genel Ayarlar",
            "Security" => "Güvenlik",
            "Email" => "E-posta",
            "Notification" => "Bildirimler",
            "Integration" => "Entegrasyonlar",
            "Appearance" => "Görünüm",
            "Localization" => "Yerelleştirme",
            _ => category
        };
    }

    private string GetCategoryDescription(string category)
    {
        return category switch
        {
            "General" => "Sistemin genel ayarları",
            "Security" => "Güvenlik ve kimlik doğrulama ayarları",
            "Email" => "E-posta sunucusu ve gönderim ayarları",
            "Notification" => "Bildirim tercihleri ve ayarları",
            "Integration" => "Dış sistem entegrasyon ayarları",
            "Appearance" => "Tema ve görünüm ayarları",
            "Localization" => "Dil ve bölge ayarları",
            _ => ""
        };
    }

    private string GetCategoryIcon(string category)
    {
        return category switch
        {
            "General" => "setting",
            "Security" => "safety",
            "Email" => "mail",
            "Notification" => "bell",
            "Integration" => "api",
            "Appearance" => "skin",
            "Localization" => "global",
            _ => "setting"
        };
    }

    private List<string>? ParseOptions(string? options)
    {
        if (string.IsNullOrWhiteSpace(options))
            return null;

        try
        {
            return JsonSerializer.Deserialize<List<string>>(options);
        }
        catch
        {
            return options.Split(',').Select(o => o.Trim()).ToList();
        }
    }

    private string DetermineCategory(string key)
    {
        if (key.StartsWith("Security.") || key.StartsWith("Auth."))
            return "Security";
        if (key.StartsWith("Email.") || key.StartsWith("Smtp."))
            return "Email";
        if (key.StartsWith("Notification."))
            return "Notification";
        if (key.StartsWith("Integration."))
            return "Integration";
        if (key.StartsWith("Appearance.") || key.StartsWith("Theme."))
            return "Appearance";
        if (key.StartsWith("Localization.") || key.StartsWith("Language."))
            return "Localization";
        return "General";
    }

    private string DetermineDataType(string value)
    {
        if (bool.TryParse(value, out _))
            return "boolean";
        if (int.TryParse(value, out _))
            return "integer";
        if (double.TryParse(value, out _))
            return "number";
        if (DateTime.TryParse(value, out _))
            return "datetime";
        return "string";
    }
}
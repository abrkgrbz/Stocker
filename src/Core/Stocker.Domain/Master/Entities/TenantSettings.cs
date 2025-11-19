using Stocker.SharedKernel.Primitives;
using System.Text.Json;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantSettings : Entity
{
    public Guid TenantId { get; private set; }

    // General Settings
    public string CompanyName { get; private set; }
    public string Timezone { get; private set; }
    public string Language { get; private set; }
    public string DateFormat { get; private set; }
    public string TimeFormat { get; private set; }
    public string Currency { get; private set; }
    public string? FiscalYearStart { get; private set; }
    public string? WeekStart { get; private set; }

    // Branding Settings
    public string? PrimaryColor { get; private set; }
    public string? SecondaryColor { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? FaviconUrl { get; private set; }
    public string? CustomFooter { get; private set; }
    public string? CustomCSS { get; private set; }
    public bool HideWatermark { get; private set; }

    // Email Settings (JSON stored)
    public string? EmailSettingsJson { get; private set; }

    // Notification Settings (JSON stored)
    public string? NotificationSettingsJson { get; private set; }

    // Security Settings (JSON stored)
    public string? SecuritySettingsJson { get; private set; }

    // API Settings (JSON stored)
    public string? ApiSettingsJson { get; private set; }

    // Storage Settings (JSON stored)
    public string? StorageSettingsJson { get; private set; }

    // Advanced Settings (JSON stored)
    public string? AdvancedSettingsJson { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? CreatedBy { get; private set; }
    public string? UpdatedBy { get; private set; }

    // Navigation
    public Tenant Tenant { get; private set; }

    private TenantSettings() { } // EF Constructor

    private TenantSettings(
        Guid tenantId,
        string companyName,
        string timezone,
        string language,
        string dateFormat,
        string timeFormat,
        string currency)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        CompanyName = companyName;
        Timezone = timezone;
        Language = language;
        DateFormat = dateFormat;
        TimeFormat = timeFormat;
        Currency = currency;
        HideWatermark = false;
        CreatedAt = DateTime.UtcNow;
    }

    public static TenantSettings Create(
        Guid tenantId,
        string companyName,
        string timezone = "Europe/Istanbul",
        string language = "tr",
        string dateFormat = "DD/MM/YYYY",
        string timeFormat = "24h",
        string currency = "TRY")
    {
        if (tenantId == Guid.Empty)
        {
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
        }

        if (string.IsNullOrWhiteSpace(companyName))
        {
            throw new ArgumentException("Company name cannot be empty.", nameof(companyName));
        }

        return new TenantSettings(tenantId, companyName, timezone, language, dateFormat, timeFormat, currency);
    }

    public void UpdateGeneralSettings(
        string companyName,
        string timezone,
        string language,
        string dateFormat,
        string timeFormat,
        string currency,
        string? fiscalYearStart,
        string? weekStart)
    {
        CompanyName = companyName;
        Timezone = timezone;
        Language = language;
        DateFormat = dateFormat;
        TimeFormat = timeFormat;
        Currency = currency;
        FiscalYearStart = fiscalYearStart;
        WeekStart = weekStart;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateBrandingSettings(
        string? primaryColor,
        string? secondaryColor,
        string? logoUrl,
        string? faviconUrl,
        string? customFooter,
        string? customCSS,
        bool hideWatermark)
    {
        PrimaryColor = primaryColor;
        SecondaryColor = secondaryColor;
        LogoUrl = logoUrl;
        FaviconUrl = faviconUrl;
        CustomFooter = customFooter;
        CustomCSS = customCSS;
        HideWatermark = hideWatermark;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateEmailSettings(string emailSettingsJson)
    {
        EmailSettingsJson = emailSettingsJson;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateNotificationSettings(string notificationSettingsJson)
    {
        NotificationSettingsJson = notificationSettingsJson;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateSecuritySettings(string securitySettingsJson)
    {
        SecuritySettingsJson = securitySettingsJson;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateApiSettings(string apiSettingsJson)
    {
        ApiSettingsJson = apiSettingsJson;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateStorageSettings(string storageSettingsJson)
    {
        StorageSettingsJson = storageSettingsJson;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateAdvancedSettings(string advancedSettingsJson)
    {
        AdvancedSettingsJson = advancedSettingsJson;
        UpdatedAt = DateTime.UtcNow;
    }

    public T? GetEmailSettings<T>() where T : class
    {
        return string.IsNullOrEmpty(EmailSettingsJson)
            ? null
            : JsonSerializer.Deserialize<T>(EmailSettingsJson);
    }

    public T? GetNotificationSettings<T>() where T : class
    {
        return string.IsNullOrEmpty(NotificationSettingsJson)
            ? null
            : JsonSerializer.Deserialize<T>(NotificationSettingsJson);
    }

    public T? GetSecuritySettings<T>() where T : class
    {
        return string.IsNullOrEmpty(SecuritySettingsJson)
            ? null
            : JsonSerializer.Deserialize<T>(SecuritySettingsJson);
    }

    public T? GetApiSettings<T>() where T : class
    {
        return string.IsNullOrEmpty(ApiSettingsJson)
            ? null
            : JsonSerializer.Deserialize<T>(ApiSettingsJson);
    }

    public T? GetStorageSettings<T>() where T : class
    {
        return string.IsNullOrEmpty(StorageSettingsJson)
            ? null
            : JsonSerializer.Deserialize<T>(StorageSettingsJson);
    }

    public T? GetAdvancedSettings<T>() where T : class
    {
        return string.IsNullOrEmpty(AdvancedSettingsJson)
            ? null
            : JsonSerializer.Deserialize<T>(AdvancedSettingsJson);
    }
}

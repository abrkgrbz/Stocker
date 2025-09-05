using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Domain.Tenant.Entities;

public sealed class TenantSettings : TenantAggregateRoot
{
    public string SettingKey { get; private set; }
    public string SettingValue { get; private set; }
    public string? Description { get; private set; }
    public string Category { get; private set; }
    public string DataType { get; private set; }
    public bool IsSystemSetting { get; private set; }
    public bool IsEncrypted { get; private set; }
    public bool IsPublic { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private TenantSettings() { } // EF Constructor

    private TenantSettings(
        Guid tenantId,
        string settingKey,
        string settingValue,
        string category,
        string dataType,
        string? description = null,
        bool isSystemSetting = false,
        bool isEncrypted = false,
        bool isPublic = false)
    {
        SetTenantId(tenantId);
        SettingKey = settingKey;
        SettingValue = settingValue;
        Category = category;
        DataType = dataType;
        Description = description;
        IsSystemSetting = isSystemSetting;
        IsEncrypted = isEncrypted;
        IsPublic = isPublic;
        CreatedAt = DateTime.UtcNow;
    }

    public static TenantSettings Create(
        Guid tenantId,
        string settingKey,
        string settingValue,
        string category = "General",
        string dataType = "String",
        string? description = null,
        bool isSystemSetting = false,
        bool isEncrypted = false,
        bool isPublic = false)
    {
        if (string.IsNullOrWhiteSpace(settingKey))
        {
            throw new ArgumentException("Setting key cannot be empty.", nameof(settingKey));
        }

        if (string.IsNullOrWhiteSpace(settingValue))
        {
            throw new ArgumentException("Setting value cannot be empty.", nameof(settingValue));
        }

        if (string.IsNullOrWhiteSpace(category))
        {
            throw new ArgumentException("Category cannot be empty.", nameof(category));
        }

        return new TenantSettings(
            tenantId,
            settingKey,
            settingValue,
            category,
            dataType,
            description,
            isSystemSetting,
            isEncrypted,
            isPublic);
    }

    public void UpdateValue(string newValue)
    {
        if (IsSystemSetting)
        {
            throw new InvalidOperationException("System settings cannot be modified.");
        }

        if (string.IsNullOrWhiteSpace(newValue))
        {
            throw new ArgumentException("Setting value cannot be empty.", nameof(newValue));
        }

        SettingValue = newValue;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDescription(string? description)
    {
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAsEncrypted()
    {
        IsEncrypted = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAsPublic()
    {
        IsPublic = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAsPrivate()
    {
        IsPublic = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
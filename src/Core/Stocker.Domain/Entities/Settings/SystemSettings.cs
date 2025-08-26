using Stocker.SharedKernel;
using System.Text.Json;

namespace Stocker.Domain.Entities.Settings;

public class SystemSettings : BaseEntity<Guid>
{
    public string Category { get; private set; } = string.Empty;
    public string Key { get; private set; } = string.Empty;
    public string Value { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string DataType { get; private set; } = "string"; // string, number, boolean, json
    public bool IsSystem { get; private set; } // System settings cannot be deleted
    public bool IsEncrypted { get; private set; } // For sensitive data
    
    protected SystemSettings() { }
    
    public SystemSettings(string category, string key, string value, string? description = null, bool isSystem = false, bool isEncrypted = false)
    {
        Id = Guid.NewGuid();
        Category = category;
        Key = key;
        Value = value;
        Description = description;
        IsSystem = isSystem;
        IsEncrypted = isEncrypted;
        CreatedAt = DateTime.UtcNow;
    }
    
    public void UpdateValue(string value)
    {
        Value = value;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public T GetValue<T>()
    {
        if (DataType == "json")
        {
            return JsonSerializer.Deserialize<T>(Value) ?? default!;
        }
        
        return (T)Convert.ChangeType(Value, typeof(T));
    }
    
    public void SetValue<T>(T value)
    {
        if (value == null) return;
        
        if (typeof(T).IsClass && typeof(T) != typeof(string))
        {
            DataType = "json";
            Value = JsonSerializer.Serialize(value);
        }
        else
        {
            Value = value.ToString() ?? string.Empty;
            DataType = typeof(T).Name.ToLower();
        }
        
        UpdatedAt = DateTime.UtcNow;
    }
}

// Predefined setting categories
public static class SettingCategories
{
    public const string General = "General";
    public const string Email = "Email";
    public const string Security = "Security";
    public const string Backup = "Backup";
    public const string Maintenance = "Maintenance";
    public const string Notifications = "Notifications";
}

// Predefined setting keys
public static class SettingKeys
{
    // General
    public const string SiteName = "SiteName";
    public const string SiteUrl = "SiteUrl";
    public const string AdminEmail = "AdminEmail";
    public const string DefaultLanguage = "DefaultLanguage";
    public const string DefaultTimezone = "DefaultTimezone";
    public const string DateFormat = "DateFormat";
    public const string TimeFormat = "TimeFormat";
    public const string Currency = "Currency";
    public const string MaxUploadSize = "MaxUploadSize";
    public const string AllowRegistration = "AllowRegistration";
    public const string RequireEmailVerification = "RequireEmailVerification";
    public const string MaintenanceMode = "MaintenanceMode";
    
    // Email
    public const string EmailProvider = "EmailProvider";
    public const string SmtpHost = "SmtpHost";
    public const string SmtpPort = "SmtpPort";
    public const string SmtpUsername = "SmtpUsername";
    public const string SmtpPassword = "SmtpPassword";
    public const string SmtpEncryption = "SmtpEncryption";
    public const string FromEmail = "FromEmail";
    public const string FromName = "FromName";
    public const string EmailTestMode = "EmailTestMode";
    
    // Security
    public const string EnforcePasswordPolicy = "EnforcePasswordPolicy";
    public const string MinPasswordLength = "MinPasswordLength";
    public const string RequireUppercase = "RequireUppercase";
    public const string RequireLowercase = "RequireLowercase";
    public const string RequireNumbers = "RequireNumbers";
    public const string RequireSpecialChars = "RequireSpecialChars";
    public const string PasswordExpiryDays = "PasswordExpiryDays";
    public const string MaxLoginAttempts = "MaxLoginAttempts";
    public const string LockoutDuration = "LockoutDuration";
    public const string EnableTwoFactor = "EnableTwoFactor";
    public const string SessionTimeout = "SessionTimeout";
    public const string EnableCaptcha = "EnableCaptcha";
    
    // Backup
    public const string BackupEnabled = "BackupEnabled";
    public const string BackupFrequency = "BackupFrequency";
    public const string BackupTime = "BackupTime";
    public const string BackupRetentionDays = "BackupRetentionDays";
    public const string BackupLocation = "BackupLocation";
    public const string BackupIncludeDatabase = "BackupIncludeDatabase";
    public const string BackupIncludeFiles = "BackupIncludeFiles";
    public const string BackupEmailNotification = "BackupEmailNotification";
    public const string BackupNotificationEmail = "BackupNotificationEmail";
}
using Stocker.SharedKernel.Primitives;
using System.Text.Json;

namespace Stocker.Domain.Entities.Settings;

public class SystemSettings : Entity
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
        Category = category;
        Key = key;
        Value = value;
        Description = description;
        IsSystem = isSystem;
        IsEncrypted = isEncrypted;
    }
    
    public void UpdateValue(string value)
    {
        Value = value;
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
    public const string EmailEnable = "Email.Enable";
    public const string EmailProvider = "Email.Provider";
    public const string SmtpHost = "Smtp.Host";
    public const string SmtpPort = "Smtp.Port";
    public const string SmtpUsername = "Smtp.Username";
    public const string SmtpPassword = "Smtp.Password";
    public const string SmtpEnableSsl = "Smtp.EnableSsl";
    public const string SmtpEncryption = "Smtp.Encryption";
    public const string EmailFromAddress = "Email.FromAddress";
    public const string EmailFromName = "Email.FromName";
    public const string EmailTestMode = "Email.TestMode";
    
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
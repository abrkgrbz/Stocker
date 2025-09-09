using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantSettings : Entity
{
    public Guid TenantId { get; private set; }
    
    // General Settings
    public string TimeZone { get; private set; }
    public string DateFormat { get; private set; }
    public string TimeFormat { get; private set; }
    public string Currency { get; private set; }
    public string Language { get; private set; }
    public string Country { get; private set; }
    
    // Business Settings
    public string? CompanyName { get; private set; }
    public string? TaxNumber { get; private set; }
    public string? Address { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string? Website { get; private set; }
    
    // Feature Toggles
    public bool EnableTwoFactor { get; private set; }
    public bool EnableApiAccess { get; private set; }
    public bool EnableWebhooks { get; private set; }
    public bool EnableEmailNotifications { get; private set; }
    public bool EnableSmsNotifications { get; private set; }
    public bool EnableAutoBackup { get; private set; }
    
    // Limits and Quotas
    public int MaxUsers { get; private set; }
    public int MaxStorage { get; private set; } // In MB
    public int MaxApiCallsPerMonth { get; private set; }
    public int DataRetentionDays { get; private set; }
    public int SessionTimeoutMinutes { get; private set; }
    
    // Customization
    public string? LogoUrl { get; private set; }
    public string? FaviconUrl { get; private set; }
    public string? PrimaryColor { get; private set; }
    public string? SecondaryColor { get; private set; }
    public string? CustomCss { get; private set; }
    
    // Email Settings
    public string? SmtpHost { get; private set; }
    public int? SmtpPort { get; private set; }
    public string? SmtpUsername { get; private set; }
    public string? SmtpPassword { get; private set; } // Encrypted
    public bool SmtpEnableSsl { get; private set; }
    public string? EmailFromAddress { get; private set; }
    public string? EmailFromName { get; private set; }
    
    // Metadata
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation property
    public Tenant Tenant { get; private set; } = null!;
    
    private TenantSettings() { } // EF Constructor
    
    private TenantSettings(Guid tenantId)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        
        // Set defaults
        TimeZone = "UTC";
        DateFormat = "MM/dd/yyyy";
        TimeFormat = "HH:mm:ss";
        Currency = "USD";
        Language = "en-US";
        Country = "US";
        
        EnableTwoFactor = false;
        EnableApiAccess = true;
        EnableWebhooks = false;
        EnableEmailNotifications = true;
        EnableSmsNotifications = false;
        EnableAutoBackup = false;
        
        MaxUsers = 10;
        MaxStorage = 1024; // 1GB
        MaxApiCallsPerMonth = 10000;
        DataRetentionDays = 90;
        SessionTimeoutMinutes = 30;
        
        SmtpEnableSsl = true;
        
        CreatedAt = DateTime.UtcNow;
    }
    
    public static TenantSettings CreateDefault(Guid tenantId)
    {
        return new TenantSettings(tenantId);
    }
    
    public void UpdateGeneralSettings(
        string timeZone,
        string dateFormat,
        string timeFormat,
        string currency,
        string language,
        string country)
    {
        TimeZone = timeZone;
        DateFormat = dateFormat;
        TimeFormat = timeFormat;
        Currency = currency;
        Language = language;
        Country = country;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateBusinessInfo(
        string? companyName,
        string? taxNumber,
        string? address,
        string? phone,
        string? email,
        string? website)
    {
        CompanyName = companyName;
        TaxNumber = taxNumber;
        Address = address;
        Phone = phone;
        Email = email;
        Website = website;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateFeatureToggles(
        bool enableTwoFactor,
        bool enableApiAccess,
        bool enableWebhooks,
        bool enableEmailNotifications,
        bool enableSmsNotifications,
        bool enableAutoBackup)
    {
        EnableTwoFactor = enableTwoFactor;
        EnableApiAccess = enableApiAccess;
        EnableWebhooks = enableWebhooks;
        EnableEmailNotifications = enableEmailNotifications;
        EnableSmsNotifications = enableSmsNotifications;
        EnableAutoBackup = enableAutoBackup;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateLimits(
        int maxUsers,
        int maxStorage,
        int maxApiCallsPerMonth,
        int dataRetentionDays,
        int sessionTimeoutMinutes)
    {
        MaxUsers = maxUsers;
        MaxStorage = maxStorage;
        MaxApiCallsPerMonth = maxApiCallsPerMonth;
        DataRetentionDays = dataRetentionDays;
        SessionTimeoutMinutes = sessionTimeoutMinutes;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateCustomization(
        string? logoUrl,
        string? faviconUrl,
        string? primaryColor,
        string? secondaryColor,
        string? customCss)
    {
        LogoUrl = logoUrl;
        FaviconUrl = faviconUrl;
        PrimaryColor = primaryColor;
        SecondaryColor = secondaryColor;
        CustomCss = customCss;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateEmailSettings(
        string? smtpHost,
        int? smtpPort,
        string? smtpUsername,
        string? smtpPassword,
        bool smtpEnableSsl,
        string? emailFromAddress,
        string? emailFromName)
    {
        SmtpHost = smtpHost;
        SmtpPort = smtpPort;
        SmtpUsername = smtpUsername;
        SmtpPassword = smtpPassword;
        SmtpEnableSsl = smtpEnableSsl;
        EmailFromAddress = emailFromAddress;
        EmailFromName = emailFromName;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetUpdatedBy(string userId)
    {
        UpdatedBy = userId;
    }
}
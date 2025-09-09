using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantSecuritySettings : Entity
{
    public Guid TenantId { get; private set; }
    
    // Password Policy
    public int MinPasswordLength { get; private set; }
    public bool RequireUppercase { get; private set; }
    public bool RequireLowercase { get; private set; }
    public bool RequireNumbers { get; private set; }
    public bool RequireSpecialCharacters { get; private set; }
    public int PasswordExpirationDays { get; private set; }
    public int PasswordHistoryCount { get; private set; } // Number of previous passwords to check
    
    // Account Lockout Policy
    public bool EnableAccountLockout { get; private set; }
    public int MaxFailedLoginAttempts { get; private set; }
    public int LockoutDurationMinutes { get; private set; }
    
    // Session Policy
    public int SessionTimeoutMinutes { get; private set; }
    public bool EnableConcurrentSessions { get; private set; }
    public int MaxConcurrentSessions { get; private set; }
    
    // Two-Factor Authentication
    public bool EnforceTwoFactor { get; private set; }
    public string? AllowedTwoFactorProviders { get; private set; } // JSON array: ["Email", "SMS", "Authenticator"]
    
    // IP Restrictions
    public bool EnableIpWhitelist { get; private set; }
    public string? WhitelistedIps { get; private set; } // JSON array of IP addresses/ranges
    public bool EnableIpBlacklist { get; private set; }
    public string? BlacklistedIps { get; private set; } // JSON array of IP addresses/ranges
    
    // Security Headers
    public bool EnableHsts { get; private set; }
    public bool EnableXFrameOptions { get; private set; }
    public bool EnableXContentTypeOptions { get; private set; }
    public bool EnableCsp { get; private set; }
    public string? CspPolicy { get; private set; }
    
    // Audit and Compliance
    public bool EnableAuditLog { get; private set; }
    public bool EnableDataEncryption { get; private set; }
    public bool EnableSensitiveDataMasking { get; private set; }
    public int AuditLogRetentionDays { get; private set; }
    
    // API Security
    public bool EnableApiRateLimiting { get; private set; }
    public int ApiRateLimitPerMinute { get; private set; }
    public bool RequireApiAuthentication { get; private set; }
    public bool EnableApiKeyRotation { get; private set; }
    public int ApiKeyRotationDays { get; private set; }
    
    // Metadata
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation property
    public Tenant Tenant { get; private set; } = null!;
    
    private TenantSecuritySettings() { } // EF Constructor
    
    private TenantSecuritySettings(Guid tenantId)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        
        // Set secure defaults
        MinPasswordLength = 8;
        RequireUppercase = true;
        RequireLowercase = true;
        RequireNumbers = true;
        RequireSpecialCharacters = true;
        PasswordExpirationDays = 90;
        PasswordHistoryCount = 5;
        
        EnableAccountLockout = true;
        MaxFailedLoginAttempts = 5;
        LockoutDurationMinutes = 15;
        
        SessionTimeoutMinutes = 30;
        EnableConcurrentSessions = true;
        MaxConcurrentSessions = 3;
        
        EnforceTwoFactor = false;
        AllowedTwoFactorProviders = "[\"Email\", \"Authenticator\"]";
        
        EnableIpWhitelist = false;
        EnableIpBlacklist = false;
        
        EnableHsts = true;
        EnableXFrameOptions = true;
        EnableXContentTypeOptions = true;
        EnableCsp = false;
        
        EnableAuditLog = true;
        EnableDataEncryption = true;
        EnableSensitiveDataMasking = true;
        AuditLogRetentionDays = 365;
        
        EnableApiRateLimiting = true;
        ApiRateLimitPerMinute = 60;
        RequireApiAuthentication = true;
        EnableApiKeyRotation = false;
        ApiKeyRotationDays = 90;
        
        CreatedAt = DateTime.UtcNow;
    }
    
    public static TenantSecuritySettings CreateDefault(Guid tenantId)
    {
        return new TenantSecuritySettings(tenantId);
    }
    
    public void UpdatePasswordPolicy(
        int minLength,
        bool requireUppercase,
        bool requireLowercase,
        bool requireNumbers,
        bool requireSpecialCharacters,
        int expirationDays,
        int historyCount)
    {
        if (minLength < 6)
            throw new ArgumentException("Minimum password length cannot be less than 6.", nameof(minLength));
            
        MinPasswordLength = minLength;
        RequireUppercase = requireUppercase;
        RequireLowercase = requireLowercase;
        RequireNumbers = requireNumbers;
        RequireSpecialCharacters = requireSpecialCharacters;
        PasswordExpirationDays = expirationDays;
        PasswordHistoryCount = historyCount;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateLockoutPolicy(
        bool enableLockout,
        int maxFailedAttempts,
        int lockoutDurationMinutes)
    {
        EnableAccountLockout = enableLockout;
        MaxFailedLoginAttempts = maxFailedAttempts;
        LockoutDurationMinutes = lockoutDurationMinutes;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateSessionPolicy(
        int sessionTimeoutMinutes,
        bool enableConcurrentSessions,
        int maxConcurrentSessions)
    {
        SessionTimeoutMinutes = sessionTimeoutMinutes;
        EnableConcurrentSessions = enableConcurrentSessions;
        MaxConcurrentSessions = maxConcurrentSessions;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateTwoFactorPolicy(
        bool enforceTwoFactor,
        string? allowedProviders)
    {
        EnforceTwoFactor = enforceTwoFactor;
        AllowedTwoFactorProviders = allowedProviders;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateIpRestrictions(
        bool enableWhitelist,
        string? whitelistedIps,
        bool enableBlacklist,
        string? blacklistedIps)
    {
        EnableIpWhitelist = enableWhitelist;
        WhitelistedIps = whitelistedIps;
        EnableIpBlacklist = enableBlacklist;
        BlacklistedIps = blacklistedIps;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateApiSecurity(
        bool enableRateLimiting,
        int rateLimitPerMinute,
        bool requireAuthentication,
        bool enableKeyRotation,
        int keyRotationDays)
    {
        EnableApiRateLimiting = enableRateLimiting;
        ApiRateLimitPerMinute = rateLimitPerMinute;
        RequireApiAuthentication = requireAuthentication;
        EnableApiKeyRotation = enableKeyRotation;
        ApiKeyRotationDays = keyRotationDays;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetUpdatedBy(string userId)
    {
        UpdatedBy = userId;
    }
}
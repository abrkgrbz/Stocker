using Stocker.Domain.Constants;
using Stocker.SharedKernel.Primitives;
using System;
using System.Collections.Generic;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Tenant'a özel güvenlik ayarları - 2FA, IP kısıtlamaları, şifre politikaları vb.
/// </summary>
public sealed class TenantSecuritySettings : Entity
{
    // Two-Factor Authentication
    public bool TwoFactorRequired { get; private set; }
    public bool TwoFactorOptional { get; private set; }
    public List<string> TwoFactorMethods { get; private set; } // SMS, Email, Authenticator, etc.
    public int TwoFactorCodeLength { get; private set; }
    public int TwoFactorCodeExpiryMinutes { get; private set; }
    public bool AllowBackupCodes { get; private set; }
    public int BackupCodesCount { get; private set; }
    
    // Password Policy
    public int MinPasswordLength { get; private set; }
    public int MaxPasswordLength { get; private set; }
    public bool RequireUppercase { get; private set; }
    public bool RequireLowercase { get; private set; }
    public bool RequireNumbers { get; private set; }
    public bool RequireSpecialCharacters { get; private set; }
    public string? SpecialCharacters { get; private set; } // Allowed special chars
    public int PasswordExpiryDays { get; private set; }
    public int PasswordHistoryCount { get; private set; } // Prevent reusing last N passwords
    public bool PreventCommonPasswords { get; private set; }
    public bool PreventUserInfoInPassword { get; private set; }
    
    // Login Security
    public int MaxLoginAttempts { get; private set; }
    public int AccountLockoutMinutes { get; private set; }
    public bool RequireCaptchaAfterFailedAttempts { get; private set; }
    public int CaptchaThreshold { get; private set; } // Number of failed attempts before captcha
    public int SessionTimeoutMinutes { get; private set; }
    public int InactivityTimeoutMinutes { get; private set; }
    public bool SingleSessionPerUser { get; private set; }
    public bool LogoutOnBrowserClose { get; private set; }
    
    // IP Restrictions
    public bool EnableIpWhitelist { get; private set; }
    public List<string>? AllowedIpAddresses { get; private set; }
    public List<string>? AllowedIpRanges { get; private set; } // CIDR notation
    public bool EnableIpBlacklist { get; private set; }
    public List<string>? BlockedIpAddresses { get; private set; }
    public List<string>? BlockedIpRanges { get; private set; }
    public bool BlockVpnAccess { get; private set; }
    public bool BlockTorAccess { get; private set; }
    public bool EnableGeoBlocking { get; private set; }
    public List<string>? AllowedCountries { get; private set; }
    public List<string>? BlockedCountries { get; private set; }
    
    // Device Management
    public bool EnableDeviceTracking { get; private set; }
    public bool RequireDeviceApproval { get; private set; }
    public int MaxDevicesPerUser { get; private set; }
    public bool NotifyOnNewDevice { get; private set; }
    public int DeviceTrustDurationDays { get; private set; }
    
    // Security Headers & CORS
    public bool EnableSecurityHeaders { get; private set; }
    public bool EnableHsts { get; private set; }
    public int HstsMaxAgeSeconds { get; private set; }
    public bool EnableCsp { get; private set; }
    public string? CspPolicy { get; private set; }
    public bool EnableCors { get; private set; }
    public List<string>? AllowedOrigins { get; private set; }
    public bool AllowCredentials { get; private set; }
    
    // Audit & Monitoring
    public bool EnableAuditLogging { get; private set; }
    public bool LogSuccessfulLogins { get; private set; }
    public bool LogFailedLogins { get; private set; }
    public bool LogDataAccess { get; private set; }
    public bool LogDataModification { get; private set; }
    public bool LogSecurityEvents { get; private set; }
    public int AuditLogRetentionDays { get; private set; }
    
    // Email Security
    public bool RequireEmailVerification { get; private set; }
    public int EmailVerificationExpiryHours { get; private set; }
    public bool NotifyPasswordChanges { get; private set; }
    public bool NotifyLoginFromNewLocation { get; private set; }
    public bool NotifySecurityChanges { get; private set; }
    
    // API Security
    public bool EnableApiRateLimiting { get; private set; }
    public int ApiRateLimitPerMinute { get; private set; }
    public int ApiRateLimitPerHour { get; private set; }
    public bool RequireApiKey { get; private set; }
    public bool RequireHttps { get; private set; }
    public int ApiKeyExpiryDays { get; private set; }
    
    // Data Protection
    public bool EnableDataEncryption { get; private set; }
    public string? EncryptionAlgorithm { get; private set; }
    public bool EnableDatabaseEncryption { get; private set; }
    public bool EnableFileEncryption { get; private set; }
    public bool AnonymizePersonalData { get; private set; }
    public int DataRetentionDays { get; private set; }
    
    // Advanced Security
    public bool EnableIntrusionDetection { get; private set; }
    public bool EnableAnomalyDetection { get; private set; }
    public bool EnableBruteForceProtection { get; private set; }
    public bool EnableSqlInjectionProtection { get; private set; }
    public bool EnableXssProtection { get; private set; }
    public bool EnableCsrfProtection { get; private set; }
    
    // Timestamps
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? LastModifiedAt { get; private set; }
    public string? LastModifiedBy { get; private set; }
    
    // Configuration
    public string? CustomConfiguration { get; private set; } // JSON for additional settings
    public bool IsDefault { get; private set; }
    public string? ProfileName { get; private set; }
    
    private TenantSecuritySettings()
    {
        TwoFactorMethods = new List<string>();
        AllowedIpAddresses = new List<string>();
        AllowedIpRanges = new List<string>();
        BlockedIpAddresses = new List<string>();
        BlockedIpRanges = new List<string>();
        AllowedCountries = new List<string>();
        BlockedCountries = new List<string>();
        AllowedOrigins = new List<string>();
    }
    
    private TenantSecuritySettings(string createdBy, string? profileName = null) : this()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
        ProfileName = profileName ?? DomainConstants.DefaultProfile;
        InitializeDefaults();
    }
    
    public static TenantSecuritySettings CreateDefault(string createdBy)
    {
        return new TenantSecuritySettings(createdBy)
        {
            IsDefault = true
        };
    }
    
    public static TenantSecuritySettings CreateCustomProfile(string profileName, string createdBy)
    {
        return new TenantSecuritySettings(createdBy, profileName)
        {
            IsDefault = false
        };
    }
    
    private void InitializeDefaults()
    {
        // Two-Factor defaults
        TwoFactorRequired = false;
        TwoFactorOptional = true;
        TwoFactorMethods = new List<string> { "Email", "Authenticator" };
        TwoFactorCodeLength = 6;
        TwoFactorCodeExpiryMinutes = 5;
        AllowBackupCodes = true;
        BackupCodesCount = 10;
        
        // Password policy defaults
        MinPasswordLength = 8;
        MaxPasswordLength = 128;
        RequireUppercase = true;
        RequireLowercase = true;
        RequireNumbers = true;
        RequireSpecialCharacters = true;
        SpecialCharacters = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        PasswordExpiryDays = 90;
        PasswordHistoryCount = 5;
        PreventCommonPasswords = true;
        PreventUserInfoInPassword = true;
        
        // Login security defaults
        MaxLoginAttempts = 5;
        AccountLockoutMinutes = 30;
        RequireCaptchaAfterFailedAttempts = true;
        CaptchaThreshold = 3;
        SessionTimeoutMinutes = 30;
        InactivityTimeoutMinutes = 15;
        SingleSessionPerUser = false;
        LogoutOnBrowserClose = false;
        
        // IP restrictions defaults
        EnableIpWhitelist = false;
        EnableIpBlacklist = false;
        BlockVpnAccess = false;
        BlockTorAccess = false;
        EnableGeoBlocking = false;
        
        // Device management defaults
        EnableDeviceTracking = true;
        RequireDeviceApproval = false;
        MaxDevicesPerUser = 5;
        NotifyOnNewDevice = true;
        DeviceTrustDurationDays = 30;
        
        // Security headers defaults
        EnableSecurityHeaders = true;
        EnableHsts = true;
        HstsMaxAgeSeconds = 31536000; // 1 year
        EnableCsp = false;
        EnableCors = true;
        AllowCredentials = true;
        
        // Audit defaults
        EnableAuditLogging = true;
        LogSuccessfulLogins = true;
        LogFailedLogins = true;
        LogDataAccess = false;
        LogDataModification = true;
        LogSecurityEvents = true;
        AuditLogRetentionDays = 365;
        
        // Email security defaults
        RequireEmailVerification = true;
        EmailVerificationExpiryHours = 24;
        NotifyPasswordChanges = true;
        NotifyLoginFromNewLocation = true;
        NotifySecurityChanges = true;
        
        // API security defaults
        EnableApiRateLimiting = true;
        ApiRateLimitPerMinute = 60;
        ApiRateLimitPerHour = 1000;
        RequireApiKey = true;
        RequireHttps = true;
        ApiKeyExpiryDays = 365;
        
        // Data protection defaults
        EnableDataEncryption = true;
        EncryptionAlgorithm = "AES-256";
        EnableDatabaseEncryption = false;
        EnableFileEncryption = true;
        AnonymizePersonalData = false;
        DataRetentionDays = 2555; // ~7 years
        
        // Advanced security defaults
        EnableIntrusionDetection = true;
        EnableAnomalyDetection = false;
        EnableBruteForceProtection = true;
        EnableSqlInjectionProtection = true;
        EnableXssProtection = true;
        EnableCsrfProtection = true;
    }
    
    // Two-Factor methods
    public void ConfigureTwoFactor(bool required, List<string> methods, int codeLength = 6, int expiryMinutes = 5)
    {
        TwoFactorRequired = required;
        TwoFactorOptional = !required;
        TwoFactorMethods = methods;
        TwoFactorCodeLength = codeLength;
        TwoFactorCodeExpiryMinutes = expiryMinutes;
        UpdateModification();
    }
    
    // Password policy methods
    public void SetPasswordPolicy(
        int minLength,
        bool requireUpper,
        bool requireLower,
        bool requireNumbers,
        bool requireSpecial,
        int expiryDays)
    {
        MinPasswordLength = minLength;
        RequireUppercase = requireUpper;
        RequireLowercase = requireLower;
        RequireNumbers = requireNumbers;
        RequireSpecialCharacters = requireSpecial;
        PasswordExpiryDays = expiryDays;
        UpdateModification();
    }
    
    // IP restriction methods
    public void ConfigureIpWhitelist(bool enable, List<string>? addresses = null, List<string>? ranges = null)
    {
        EnableIpWhitelist = enable;
        AllowedIpAddresses = addresses ?? new List<string>();
        AllowedIpRanges = ranges ?? new List<string>();
        UpdateModification();
    }
    
    public void ConfigureIpBlacklist(bool enable, List<string>? addresses = null, List<string>? ranges = null)
    {
        EnableIpBlacklist = enable;
        BlockedIpAddresses = addresses ?? new List<string>();
        BlockedIpRanges = ranges ?? new List<string>();
        UpdateModification();
    }
    
    // Geo-blocking methods
    public void ConfigureGeoBlocking(bool enable, List<string>? allowedCountries = null, List<string>? blockedCountries = null)
    {
        EnableGeoBlocking = enable;
        AllowedCountries = allowedCountries ?? new List<string>();
        BlockedCountries = blockedCountries ?? new List<string>();
        UpdateModification();
    }
    
    // Session configuration
    public void ConfigureSession(int timeoutMinutes, int inactivityMinutes, bool singleSession)
    {
        SessionTimeoutMinutes = timeoutMinutes;
        InactivityTimeoutMinutes = inactivityMinutes;
        SingleSessionPerUser = singleSession;
        UpdateModification();
    }
    
    // API configuration
    public void ConfigureApiSecurity(bool requireKey, bool requireHttps, int rateLimitPerMinute)
    {
        RequireApiKey = requireKey;
        RequireHttps = requireHttps;
        ApiRateLimitPerMinute = rateLimitPerMinute;
        EnableApiRateLimiting = rateLimitPerMinute > 0;
        UpdateModification();
    }
    
    // Audit configuration
    public void ConfigureAuditLogging(bool enable, bool logSuccess, bool logFailure, int retentionDays)
    {
        EnableAuditLogging = enable;
        LogSuccessfulLogins = logSuccess;
        LogFailedLogins = logFailure;
        AuditLogRetentionDays = retentionDays;
        UpdateModification();
    }
    
    public void SetCustomConfiguration(string jsonConfig)
    {
        CustomConfiguration = jsonConfig;
        UpdateModification();
    }
    
    private void UpdateModification()
    {
        LastModifiedAt = DateTime.UtcNow;
    }
    
    public void UpdateModifiedBy(string modifiedBy)
    {
        LastModifiedBy = modifiedBy;
        UpdateModification();
    }
}
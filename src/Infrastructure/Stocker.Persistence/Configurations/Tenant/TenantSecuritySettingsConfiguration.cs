using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;
using System.Text.Json;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantSecuritySettingsConfiguration : IEntityTypeConfiguration<TenantSecuritySettings>
{
    public void Configure(EntityTypeBuilder<TenantSecuritySettings> builder)
    {
        // Table name
        builder.ToTable("TenantSecuritySettings");
        
        // Primary key
        builder.HasKey(s => s.Id);
        
        // Two-Factor Authentication
        builder.Property(s => s.TwoFactorRequired)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.TwoFactorOptional)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.TwoFactorMethods)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(s => s.TwoFactorCodeLength)
            .IsRequired()
            .HasDefaultValue(6);
            
        builder.Property(s => s.TwoFactorCodeExpiryMinutes)
            .IsRequired()
            .HasDefaultValue(5);
            
        builder.Property(s => s.AllowBackupCodes)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.BackupCodesCount)
            .IsRequired()
            .HasDefaultValue(10);
            
        // Password Policy
        builder.Property(s => s.MinPasswordLength)
            .IsRequired()
            .HasDefaultValue(8);
            
        builder.Property(s => s.MaxPasswordLength)
            .IsRequired()
            .HasDefaultValue(128);
            
        builder.Property(s => s.RequireUppercase)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.RequireLowercase)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.RequireNumbers)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.RequireSpecialCharacters)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.SpecialCharacters)
            .HasMaxLength(100);
            
        builder.Property(s => s.PasswordExpiryDays)
            .IsRequired()
            .HasDefaultValue(90);
            
        builder.Property(s => s.PasswordHistoryCount)
            .IsRequired()
            .HasDefaultValue(5);
            
        builder.Property(s => s.PreventCommonPasswords)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.PreventUserInfoInPassword)
            .IsRequired()
            .HasDefaultValue(true);
            
        // Login Security
        builder.Property(s => s.MaxLoginAttempts)
            .IsRequired()
            .HasDefaultValue(5);
            
        builder.Property(s => s.AccountLockoutMinutes)
            .IsRequired()
            .HasDefaultValue(30);
            
        builder.Property(s => s.RequireCaptchaAfterFailedAttempts)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.CaptchaThreshold)
            .IsRequired()
            .HasDefaultValue(3);
            
        builder.Property(s => s.SessionTimeoutMinutes)
            .IsRequired()
            .HasDefaultValue(30);
            
        builder.Property(s => s.InactivityTimeoutMinutes)
            .IsRequired()
            .HasDefaultValue(15);
            
        builder.Property(s => s.SingleSessionPerUser)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.LogoutOnBrowserClose)
            .IsRequired()
            .HasDefaultValue(false);
            
        // IP Restrictions - JSON arrays
        builder.Property(s => s.EnableIpWhitelist)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.AllowedIpAddresses)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(s => s.AllowedIpRanges)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(s => s.EnableIpBlacklist)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.BlockedIpAddresses)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(s => s.BlockedIpRanges)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(s => s.BlockVpnAccess)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.BlockTorAccess)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.EnableGeoBlocking)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.AllowedCountries)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(s => s.BlockedCountries)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Device Management
        builder.Property(s => s.EnableDeviceTracking)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.RequireDeviceApproval)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.MaxDevicesPerUser)
            .IsRequired()
            .HasDefaultValue(5);
            
        builder.Property(s => s.NotifyOnNewDevice)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.DeviceTrustDurationDays)
            .IsRequired()
            .HasDefaultValue(30);
            
        // Security Headers & CORS
        builder.Property(s => s.EnableSecurityHeaders)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.EnableHsts)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.HstsMaxAgeSeconds)
            .IsRequired()
            .HasDefaultValue(31536000);
            
        builder.Property(s => s.EnableCsp)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.CspPolicy)
            .HasMaxLength(2000);
            
        builder.Property(s => s.EnableCors)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.AllowedOrigins)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(s => s.AllowCredentials)
            .IsRequired()
            .HasDefaultValue(true);
            
        // Audit & Monitoring
        builder.Property(s => s.EnableAuditLogging)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.LogSuccessfulLogins)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.LogFailedLogins)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.LogDataAccess)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.LogDataModification)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.LogSecurityEvents)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.AuditLogRetentionDays)
            .IsRequired()
            .HasDefaultValue(365);
            
        // Email Security
        builder.Property(s => s.RequireEmailVerification)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.EmailVerificationExpiryHours)
            .IsRequired()
            .HasDefaultValue(24);
            
        builder.Property(s => s.NotifyPasswordChanges)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.NotifyLoginFromNewLocation)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.NotifySecurityChanges)
            .IsRequired()
            .HasDefaultValue(true);
            
        // API Security
        builder.Property(s => s.EnableApiRateLimiting)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.ApiRateLimitPerMinute)
            .IsRequired()
            .HasDefaultValue(60);
            
        builder.Property(s => s.ApiRateLimitPerHour)
            .IsRequired()
            .HasDefaultValue(1000);
            
        builder.Property(s => s.RequireApiKey)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.RequireHttps)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.ApiKeyExpiryDays)
            .IsRequired()
            .HasDefaultValue(365);
            
        // Data Protection
        builder.Property(s => s.EnableDataEncryption)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.EncryptionAlgorithm)
            .HasMaxLength(50);
            
        builder.Property(s => s.EnableDatabaseEncryption)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.EnableFileEncryption)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.AnonymizePersonalData)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.DataRetentionDays)
            .IsRequired()
            .HasDefaultValue(2555);
            
        // Advanced Security
        builder.Property(s => s.EnableIntrusionDetection)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.EnableAnomalyDetection)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.EnableBruteForceProtection)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.EnableSqlInjectionProtection)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.EnableXssProtection)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(s => s.EnableCsrfProtection)
            .IsRequired()
            .HasDefaultValue(true);
            
        // Timestamps
        builder.Property(s => s.CreatedAt)
            .IsRequired();
            
        builder.Property(s => s.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(s => s.LastModifiedAt);
        
        builder.Property(s => s.LastModifiedBy)
            .HasMaxLength(100);
            
        // Configuration
        builder.Property(s => s.CustomConfiguration)
            .HasColumnType("nvarchar(max)");
            
        builder.Property(s => s.IsDefault)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(s => s.ProfileName)
            .HasMaxLength(100);
            
        // Indexes
        builder.HasIndex(s => s.ProfileName)
            .HasDatabaseName("IX_TenantSecuritySettings_ProfileName")
            .IsUnique();
            
        builder.HasIndex(s => s.IsDefault)
            .HasDatabaseName("IX_TenantSecuritySettings_IsDefault");
            
        builder.HasIndex(s => s.CreatedAt)
            .HasDatabaseName("IX_TenantSecuritySettings_CreatedAt");
    }
}
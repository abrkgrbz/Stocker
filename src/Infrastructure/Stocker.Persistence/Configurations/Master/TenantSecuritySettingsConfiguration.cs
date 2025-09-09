using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantSecuritySettingsConfiguration : IEntityTypeConfiguration<TenantSecuritySettings>
{
    public void Configure(EntityTypeBuilder<TenantSecuritySettings> builder)
    {
        builder.ToTable("TenantSecuritySettings", "Master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedNever();

        builder.Property(x => x.TenantId)
            .HasColumnName("TenantId")
            .IsRequired();

        // Password Policy
        builder.Property(x => x.MinPasswordLength)
            .HasColumnName("MinPasswordLength")
            .IsRequired();

        builder.Property(x => x.RequireUppercase)
            .HasColumnName("RequireUppercase")
            .IsRequired();

        builder.Property(x => x.RequireLowercase)
            .HasColumnName("RequireLowercase")
            .IsRequired();

        builder.Property(x => x.RequireNumbers)
            .HasColumnName("RequireNumbers")
            .IsRequired();

        builder.Property(x => x.RequireSpecialCharacters)
            .HasColumnName("RequireSpecialCharacters")
            .IsRequired();

        builder.Property(x => x.PasswordExpirationDays)
            .HasColumnName("PasswordExpirationDays")
            .IsRequired();

        builder.Property(x => x.PasswordHistoryCount)
            .HasColumnName("PasswordHistoryCount")
            .IsRequired();

        // Account Lockout Policy
        builder.Property(x => x.EnableAccountLockout)
            .HasColumnName("EnableAccountLockout")
            .IsRequired();

        builder.Property(x => x.MaxFailedLoginAttempts)
            .HasColumnName("MaxFailedLoginAttempts")
            .IsRequired();

        builder.Property(x => x.LockoutDurationMinutes)
            .HasColumnName("LockoutDurationMinutes")
            .IsRequired();

        // Session Policy
        builder.Property(x => x.SessionTimeoutMinutes)
            .HasColumnName("SessionTimeoutMinutes")
            .IsRequired();

        builder.Property(x => x.EnableConcurrentSessions)
            .HasColumnName("EnableConcurrentSessions")
            .IsRequired();

        builder.Property(x => x.MaxConcurrentSessions)
            .HasColumnName("MaxConcurrentSessions")
            .IsRequired();

        // Two-Factor Authentication
        builder.Property(x => x.EnforceTwoFactor)
            .HasColumnName("EnforceTwoFactor")
            .IsRequired();

        builder.Property(x => x.AllowedTwoFactorProviders)
            .HasColumnName("AllowedTwoFactorProviders")
            .HasColumnType("nvarchar(max)");

        // IP Restrictions
        builder.Property(x => x.EnableIpWhitelist)
            .HasColumnName("EnableIpWhitelist")
            .IsRequired();

        builder.Property(x => x.WhitelistedIps)
            .HasColumnName("WhitelistedIps")
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.EnableIpBlacklist)
            .HasColumnName("EnableIpBlacklist")
            .IsRequired();

        builder.Property(x => x.BlacklistedIps)
            .HasColumnName("BlacklistedIps")
            .HasColumnType("nvarchar(max)");

        // Security Headers
        builder.Property(x => x.EnableHsts)
            .HasColumnName("EnableHsts")
            .IsRequired();

        builder.Property(x => x.EnableXFrameOptions)
            .HasColumnName("EnableXFrameOptions")
            .IsRequired();

        builder.Property(x => x.EnableXContentTypeOptions)
            .HasColumnName("EnableXContentTypeOptions")
            .IsRequired();

        builder.Property(x => x.EnableCsp)
            .HasColumnName("EnableCsp")
            .IsRequired();

        builder.Property(x => x.CspPolicy)
            .HasColumnName("CspPolicy")
            .HasColumnType("nvarchar(max)");

        // Audit and Compliance
        builder.Property(x => x.EnableAuditLog)
            .HasColumnName("EnableAuditLog")
            .IsRequired();

        builder.Property(x => x.EnableDataEncryption)
            .HasColumnName("EnableDataEncryption")
            .IsRequired();

        builder.Property(x => x.EnableSensitiveDataMasking)
            .HasColumnName("EnableSensitiveDataMasking")
            .IsRequired();

        builder.Property(x => x.AuditLogRetentionDays)
            .HasColumnName("AuditLogRetentionDays")
            .IsRequired();

        // API Security
        builder.Property(x => x.EnableApiRateLimiting)
            .HasColumnName("EnableApiRateLimiting")
            .IsRequired();

        builder.Property(x => x.ApiRateLimitPerMinute)
            .HasColumnName("ApiRateLimitPerMinute")
            .IsRequired();

        builder.Property(x => x.RequireApiAuthentication)
            .HasColumnName("RequireApiAuthentication")
            .IsRequired();

        builder.Property(x => x.EnableApiKeyRotation)
            .HasColumnName("EnableApiKeyRotation")
            .IsRequired();

        builder.Property(x => x.ApiKeyRotationDays)
            .HasColumnName("ApiKeyRotationDays")
            .IsRequired();

        // Metadata
        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("UpdatedAt");

        builder.Property(x => x.UpdatedBy)
            .HasColumnName("UpdatedBy")
            .HasMaxLength(100);

        // Relationships
        builder.HasOne(x => x.Tenant)
            .WithOne()
            .HasForeignKey<TenantSecuritySettings>(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_TenantSecuritySettings_TenantId")
            .IsUnique();
    }
}
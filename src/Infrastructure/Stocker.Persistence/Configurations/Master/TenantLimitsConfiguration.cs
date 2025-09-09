using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantLimitsConfiguration : IEntityTypeConfiguration<TenantLimits>
{
    public void Configure(EntityTypeBuilder<TenantLimits> builder)
    {
        builder.ToTable("TenantLimits", "Master");
        
        builder.HasKey(x => x.Id);
        
        // User Limits
        builder.Property(x => x.MaxUsers)
            .IsRequired();
            
        builder.Property(x => x.CurrentUsers)
            .IsRequired();
            
        builder.Property(x => x.MaxAdminUsers)
            .IsRequired();
            
        builder.Property(x => x.CurrentAdminUsers)
            .IsRequired();
            
        builder.Property(x => x.MaxConcurrentUsers)
            .IsRequired();
            
        builder.Property(x => x.CurrentConcurrentUsers)
            .IsRequired();
            
        // Storage Limits
        builder.Property(x => x.MaxStorageGB)
            .IsRequired()
            .HasPrecision(10, 2);
            
        builder.Property(x => x.CurrentStorageGB)
            .IsRequired()
            .HasPrecision(10, 2);
            
        builder.Property(x => x.MaxDatabaseSizeGB)
            .IsRequired()
            .HasPrecision(10, 2);
            
        builder.Property(x => x.CurrentDatabaseSizeGB)
            .IsRequired()
            .HasPrecision(10, 2);
            
        builder.Property(x => x.MaxFileUploadSizeMB)
            .IsRequired()
            .HasPrecision(10, 2);
            
        // Transaction Limits
        builder.Property(x => x.MaxMonthlyTransactions)
            .IsRequired();
            
        builder.Property(x => x.CurrentMonthlyTransactions)
            .IsRequired();
            
        builder.Property(x => x.MaxDailyTransactions)
            .IsRequired();
            
        builder.Property(x => x.CurrentDailyTransactions)
            .IsRequired();
            
        builder.Property(x => x.MaxTransactionsPerMinute)
            .IsRequired();
            
        // API Limits
        builder.Property(x => x.MaxMonthlyApiCalls)
            .IsRequired();
            
        builder.Property(x => x.CurrentMonthlyApiCalls)
            .IsRequired();
            
        builder.Property(x => x.MaxDailyApiCalls)
            .IsRequired();
            
        builder.Property(x => x.CurrentDailyApiCalls)
            .IsRequired();
            
        builder.Property(x => x.MaxApiCallsPerMinute)
            .IsRequired();
            
        builder.Property(x => x.MaxApiKeys)
            .IsRequired();
            
        builder.Property(x => x.CurrentApiKeys)
            .IsRequired();
            
        // Module & Feature Limits
        builder.Property(x => x.MaxCustomModules)
            .IsRequired();
            
        builder.Property(x => x.CurrentCustomModules)
            .IsRequired();
            
        builder.Property(x => x.MaxCustomReports)
            .IsRequired();
            
        builder.Property(x => x.CurrentCustomReports)
            .IsRequired();
            
        builder.Property(x => x.MaxCustomFields)
            .IsRequired();
            
        builder.Property(x => x.CurrentCustomFields)
            .IsRequired();
            
        builder.Property(x => x.MaxWorkflows)
            .IsRequired();
            
        builder.Property(x => x.CurrentWorkflows)
            .IsRequired();
            
        // Communication Limits
        builder.Property(x => x.MaxMonthlyEmails)
            .IsRequired();
            
        builder.Property(x => x.CurrentMonthlyEmails)
            .IsRequired();
            
        builder.Property(x => x.MaxMonthlySMS)
            .IsRequired();
            
        builder.Property(x => x.CurrentMonthlySMS)
            .IsRequired();
            
        builder.Property(x => x.MaxEmailTemplates)
            .IsRequired();
            
        builder.Property(x => x.CurrentEmailTemplates)
            .IsRequired();
            
        // Integration Limits
        builder.Property(x => x.MaxIntegrations)
            .IsRequired();
            
        builder.Property(x => x.CurrentIntegrations)
            .IsRequired();
            
        builder.Property(x => x.MaxWebhooks)
            .IsRequired();
            
        builder.Property(x => x.CurrentWebhooks)
            .IsRequired();
            
        builder.Property(x => x.MaxCustomDomains)
            .IsRequired();
            
        builder.Property(x => x.CurrentCustomDomains)
            .IsRequired();
            
        // Backup & Export Limits
        builder.Property(x => x.MaxBackupsPerMonth)
            .IsRequired();
            
        builder.Property(x => x.CurrentBackupsThisMonth)
            .IsRequired();
            
        builder.Property(x => x.MaxExportsPerDay)
            .IsRequired();
            
        builder.Property(x => x.CurrentExportsToday)
            .IsRequired();
            
        builder.Property(x => x.MaxExportSizeGB)
            .IsRequired()
            .HasPrecision(10, 2);
            
        // Performance Limits
        builder.Property(x => x.MaxDatabaseConnections)
            .IsRequired();
            
        builder.Property(x => x.CurrentDatabaseConnections)
            .IsRequired();
            
        builder.Property(x => x.MaxCPUCores)
            .IsRequired();
            
        builder.Property(x => x.MaxMemoryGB)
            .IsRequired();
            
        // Audit & Retention
        builder.Property(x => x.DataRetentionDays)
            .IsRequired();
            
        builder.Property(x => x.AuditLogRetentionDays)
            .IsRequired();
            
        builder.Property(x => x.BackupRetentionDays)
            .IsRequired();
            
        // Limit Actions
        builder.Property(x => x.UserLimitAction)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.StorageLimitAction)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.TransactionLimitAction)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.ApiLimitAction)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        // Notifications
        builder.Property(x => x.WarningThresholdPercentage)
            .IsRequired()
            .HasPrecision(5, 2);
            
        builder.Property(x => x.SendWarningNotifications)
            .IsRequired();
            
        builder.Property(x => x.SendLimitExceededNotifications)
            .IsRequired();
            
        // Status
        builder.Property(x => x.IsActive)
            .IsRequired();
            
        // Audit
        builder.Property(x => x.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithOne(t => t.Limits)
            .HasForeignKey<TenantLimits>(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(x => x.TenantId)
            .IsUnique();
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.LastResetDate);
        builder.HasIndex(x => x.NextResetDate);
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantHealthCheckConfiguration : IEntityTypeConfiguration<TenantHealthCheck>
{
    public void Configure(EntityTypeBuilder<TenantHealthCheck> builder)
    {
        builder.ToTable("TenantHealthChecks", "Master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedNever();

        builder.Property(x => x.TenantId)
            .HasColumnName("TenantId")
            .IsRequired();

        builder.Property(x => x.CheckedAt)
            .HasColumnName("CheckedAt")
            .IsRequired();

        // Overall Status
        builder.Property(x => x.OverallStatus)
            .HasColumnName("OverallStatus")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.HealthScore)
            .HasColumnName("HealthScore")
            .IsRequired();

        // Database Health
        builder.Property(x => x.IsDatabaseHealthy)
            .HasColumnName("IsDatabaseHealthy")
            .IsRequired();

        builder.Property(x => x.DatabaseResponseTimeMs)
            .HasColumnName("DatabaseResponseTimeMs")
            .IsRequired();

        builder.Property(x => x.DatabaseSizeMb)
            .HasColumnName("DatabaseSizeMb")
            .IsRequired();

        builder.Property(x => x.ActiveConnections)
            .HasColumnName("ActiveConnections")
            .IsRequired();

        // API Health
        builder.Property(x => x.IsApiHealthy)
            .HasColumnName("IsApiHealthy")
            .IsRequired();

        builder.Property(x => x.ApiResponseTimeMs)
            .HasColumnName("ApiResponseTimeMs")
            .IsRequired();

        builder.Property(x => x.ApiErrorRate)
            .HasColumnName("ApiErrorRate")
            .IsRequired();

        builder.Property(x => x.ApiRequestsPerMinute)
            .HasColumnName("ApiRequestsPerMinute")
            .IsRequired();

        // Storage Health
        builder.Property(x => x.IsStorageHealthy)
            .HasColumnName("IsStorageHealthy")
            .IsRequired();

        builder.Property(x => x.StorageUsedMb)
            .HasColumnName("StorageUsedMb")
            .IsRequired();

        builder.Property(x => x.StorageAvailableMb)
            .HasColumnName("StorageAvailableMb")
            .IsRequired();

        builder.Property(x => x.StorageUsagePercent)
            .HasColumnName("StorageUsagePercent")
            .IsRequired();

        // Service Health
        builder.Property(x => x.IsEmailServiceHealthy)
            .HasColumnName("IsEmailServiceHealthy")
            .IsRequired();

        builder.Property(x => x.IsNotificationServiceHealthy)
            .HasColumnName("IsNotificationServiceHealthy")
            .IsRequired();

        builder.Property(x => x.IsBackgroundJobsHealthy)
            .HasColumnName("IsBackgroundJobsHealthy")
            .IsRequired();

        builder.Property(x => x.IsCacheHealthy)
            .HasColumnName("IsCacheHealthy")
            .IsRequired();

        // Performance Metrics
        builder.Property(x => x.CpuUsagePercent)
            .HasColumnName("CpuUsagePercent")
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(x => x.MemoryUsagePercent)
            .HasColumnName("MemoryUsagePercent")
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(x => x.ActiveUsers)
            .HasColumnName("ActiveUsers")
            .IsRequired();

        builder.Property(x => x.ConcurrentSessions)
            .HasColumnName("ConcurrentSessions")
            .IsRequired();

        // Security Health
        builder.Property(x => x.FailedLoginAttempts)
            .HasColumnName("FailedLoginAttempts")
            .IsRequired();

        builder.Property(x => x.SecurityIncidents)
            .HasColumnName("SecurityIncidents")
            .IsRequired();

        builder.Property(x => x.LastSecurityScan)
            .HasColumnName("LastSecurityScan");

        builder.Property(x => x.HasSecurityUpdates)
            .HasColumnName("HasSecurityUpdates")
            .IsRequired();

        // Backup Health
        builder.Property(x => x.LastBackupDate)
            .HasColumnName("LastBackupDate");

        builder.Property(x => x.IsBackupHealthy)
            .HasColumnName("IsBackupHealthy")
            .IsRequired();

        builder.Property(x => x.LastBackupSizeMb)
            .HasColumnName("LastBackupSizeMb")
            .IsRequired();

        // Errors and Warnings
        builder.Property(x => x.Errors)
            .HasColumnName("Errors")
            .HasColumnType("text");

        builder.Property(x => x.Warnings)
            .HasColumnName("Warnings")
            .HasColumnType("text");

        builder.Property(x => x.ErrorCount)
            .HasColumnName("ErrorCount")
            .IsRequired();

        builder.Property(x => x.WarningCount)
            .HasColumnName("WarningCount")
            .IsRequired();

        // Relationships
        builder.HasOne(x => x.Tenant)
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_TenantHealthChecks_TenantId");

        builder.HasIndex(x => x.CheckedAt)
            .HasDatabaseName("IX_TenantHealthChecks_CheckedAt");

        builder.HasIndex(x => new { x.TenantId, x.CheckedAt })
            .HasDatabaseName("IX_TenantHealthChecks_TenantId_CheckedAt");
    }
}
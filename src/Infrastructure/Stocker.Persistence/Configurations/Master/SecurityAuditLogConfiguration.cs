using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class SecurityAuditLogConfiguration : BaseEntityTypeConfiguration<SecurityAuditLog>
{
    public override void Configure(EntityTypeBuilder<SecurityAuditLog> builder)
    {
        base.Configure(builder);

        builder.ToTable("SecurityAuditLogs", "master");

        // Primary columns
        builder.Property(a => a.Timestamp)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(a => a.Event)
            .IsRequired()
            .HasMaxLength(100);

        // User/Auth info
        builder.Property(a => a.UserId)
            .IsRequired(false);

        builder.Property(a => a.Email)
            .HasMaxLength(255);

        builder.Property(a => a.TenantCode)
            .HasMaxLength(50);

        // Request info
        builder.Property(a => a.IpAddress)
            .HasMaxLength(45); // IPv6 support

        builder.Property(a => a.UserAgent)
            .HasMaxLength(500);

        builder.Property(a => a.RequestId)
            .HasMaxLength(100);

        // Security
        builder.Property(a => a.RiskScore)
            .IsRequired(false);

        builder.Property(a => a.Blocked)
            .IsRequired()
            .HasDefaultValue(false);

        // Metadata (JSON)
        builder.Property(a => a.Metadata)
            .HasColumnType("text");

        builder.Property(a => a.DurationMs)
            .IsRequired(false);

        // Compliance
        builder.Property(a => a.GdprCategory)
            .HasMaxLength(50);

        builder.Property(a => a.RetentionDays)
            .IsRequired()
            .HasDefaultValue(365);

        builder.Property(a => a.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        // Indexes for performance
        builder.HasIndex(a => a.Timestamp)
            .HasDatabaseName("IX_SecurityAuditLogs_Timestamp")
            .IsDescending();

        builder.HasIndex(a => a.Event)
            .HasDatabaseName("IX_SecurityAuditLogs_Event");

        builder.HasIndex(a => a.Email)
            .HasDatabaseName("IX_SecurityAuditLogs_Email");

        builder.HasIndex(a => a.TenantCode)
            .HasDatabaseName("IX_SecurityAuditLogs_TenantCode");

        builder.HasIndex(a => a.IpAddress)
            .HasDatabaseName("IX_SecurityAuditLogs_IpAddress");

        builder.HasIndex(a => a.UserId)
            .HasDatabaseName("IX_SecurityAuditLogs_UserId");

        builder.HasIndex(a => a.RiskScore)
            .HasDatabaseName("IX_SecurityAuditLogs_RiskScore")
            .HasFilter("\"RiskScore\" > 50");

        builder.HasIndex(a => new { a.Event, a.Timestamp })
            .HasDatabaseName("IX_SecurityAuditLogs_Event_Timestamp");

        builder.HasIndex(a => new { a.Email, a.Timestamp })
            .HasDatabaseName("IX_SecurityAuditLogs_Email_Timestamp");

        builder.HasIndex(a => new { a.IpAddress, a.Timestamp })
            .HasDatabaseName("IX_SecurityAuditLogs_IpAddress_Timestamp");
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class SystemAlertConfiguration : BaseEntityTypeConfiguration<SystemAlert>
{
    public override void Configure(EntityTypeBuilder<SystemAlert> builder)
    {
        base.Configure(builder);

        builder.ToTable("SystemAlerts", "master");

        builder.Property(a => a.Type)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Severity)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(a => a.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Message)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(a => a.Source)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(a => a.Timestamp)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(a => a.AcknowledgedBy)
            .HasMaxLength(255);

        builder.Property(a => a.AcknowledgedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(a => a.DismissedBy)
            .HasMaxLength(255);

        builder.Property(a => a.DismissedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(a => a.Metadata)
            .HasColumnType("text");

        // Indexes
        builder.HasIndex(a => a.IsActive)
            .HasDatabaseName("IX_SystemAlerts_IsActive");

        builder.HasIndex(a => a.Timestamp)
            .HasDatabaseName("IX_SystemAlerts_Timestamp")
            .IsDescending();

        builder.HasIndex(a => a.Severity)
            .HasDatabaseName("IX_SystemAlerts_Severity");

        builder.HasIndex(a => a.Type)
            .HasDatabaseName("IX_SystemAlerts_Type");

        builder.HasIndex(a => new { a.IsActive, a.Timestamp })
            .HasDatabaseName("IX_SystemAlerts_IsActive_Timestamp");

        builder.HasIndex(a => new { a.Severity, a.IsActive })
            .HasDatabaseName("IX_SystemAlerts_Severity_IsActive");
    }
}

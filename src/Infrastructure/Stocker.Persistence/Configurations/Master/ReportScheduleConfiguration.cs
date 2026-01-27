using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class ReportScheduleConfiguration : BaseEntityTypeConfiguration<ReportSchedule>
{
    public override void Configure(EntityTypeBuilder<ReportSchedule> builder)
    {
        base.Configure(builder);

        builder.ToTable("ReportSchedules", "master");

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.ReportType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.Frequency)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(r => r.CronExpression)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.IsEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(r => r.Recipients)
            .IsRequired()
            .HasColumnType("text"); // JSON array of emails

        builder.Property(r => r.Parameters)
            .HasColumnType("text"); // JSON for report parameters

        builder.Property(r => r.LastRunAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(r => r.NextRunAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(r => r.CreatedBy)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(r => r.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(r => r.UpdatedAt)
            .HasColumnType("timestamp with time zone");

        // Indexes
        builder.HasIndex(r => r.IsEnabled)
            .HasDatabaseName("IX_ReportSchedules_IsEnabled");

        builder.HasIndex(r => r.NextRunAt)
            .HasDatabaseName("IX_ReportSchedules_NextRunAt");

        builder.HasIndex(r => r.ReportType)
            .HasDatabaseName("IX_ReportSchedules_ReportType");

        builder.HasIndex(r => new { r.IsEnabled, r.NextRunAt })
            .HasDatabaseName("IX_ReportSchedules_IsEnabled_NextRunAt");
    }
}

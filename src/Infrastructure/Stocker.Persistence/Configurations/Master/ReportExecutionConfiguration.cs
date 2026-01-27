using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class ReportExecutionConfiguration : BaseEntityTypeConfiguration<ReportExecution>
{
    public override void Configure(EntityTypeBuilder<ReportExecution> builder)
    {
        base.Configure(builder);

        builder.ToTable("ReportExecutions", "master");

        builder.Property(r => r.ScheduleId)
            .IsRequired(false);

        builder.Property(r => r.ReportType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.ReportName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(r => r.StartedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(r => r.CompletedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(r => r.DurationMs)
            .IsRequired(false);

        builder.Property(r => r.OutputPath)
            .HasMaxLength(500);

        builder.Property(r => r.FileSizeBytes)
            .IsRequired(false);

        builder.Property(r => r.Parameters)
            .HasColumnType("text"); // JSON

        builder.Property(r => r.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(r => r.ExecutedBy)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(r => r.RecordCount)
            .IsRequired(false);

        // Foreign key to ReportSchedule (optional)
        builder.HasOne<ReportSchedule>()
            .WithMany()
            .HasForeignKey(r => r.ScheduleId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(r => r.ScheduleId)
            .HasDatabaseName("IX_ReportExecutions_ScheduleId");

        builder.HasIndex(r => r.Status)
            .HasDatabaseName("IX_ReportExecutions_Status");

        builder.HasIndex(r => r.StartedAt)
            .HasDatabaseName("IX_ReportExecutions_StartedAt")
            .IsDescending();

        builder.HasIndex(r => r.ReportType)
            .HasDatabaseName("IX_ReportExecutions_ReportType");

        builder.HasIndex(r => new { r.ScheduleId, r.StartedAt })
            .HasDatabaseName("IX_ReportExecutions_ScheduleId_StartedAt");

        builder.HasIndex(r => new { r.Status, r.StartedAt })
            .HasDatabaseName("IX_ReportExecutions_Status_StartedAt");
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class BackupScheduleConfiguration : IEntityTypeConfiguration<BackupSchedule>
{
    public void Configure(EntityTypeBuilder<BackupSchedule> builder)
    {
        builder.ToTable("BackupSchedules", "Master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedNever();

        builder.Property(x => x.TenantId)
            .HasColumnName("TenantId")
            .IsRequired();

        builder.Property(x => x.ScheduleName)
            .HasColumnName("ScheduleName")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.ScheduleType)
            .HasColumnName("ScheduleType")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CronExpression)
            .HasColumnName("CronExpression")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.BackupType)
            .HasColumnName("BackupType")
            .HasMaxLength(50)
            .IsRequired();

        // Backup Options
        builder.Property(x => x.IncludeDatabase)
            .HasColumnName("IncludeDatabase")
            .IsRequired();

        builder.Property(x => x.IncludeFiles)
            .HasColumnName("IncludeFiles")
            .IsRequired();

        builder.Property(x => x.IncludeConfiguration)
            .HasColumnName("IncludeConfiguration")
            .IsRequired();

        builder.Property(x => x.Compress)
            .HasColumnName("Compress")
            .IsRequired();

        builder.Property(x => x.Encrypt)
            .HasColumnName("Encrypt")
            .IsRequired();

        builder.Property(x => x.RetentionDays)
            .HasColumnName("RetentionDays")
            .IsRequired()
            .HasDefaultValue(30);

        // Status
        builder.Property(x => x.IsEnabled)
            .HasColumnName("IsEnabled")
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.HangfireJobId)
            .HasColumnName("HangfireJobId")
            .HasMaxLength(200);

        // Execution Info
        builder.Property(x => x.LastExecutedAt)
            .HasColumnName("LastExecutedAt");

        builder.Property(x => x.NextExecutionAt)
            .HasColumnName("NextExecutionAt");

        builder.Property(x => x.SuccessCount)
            .HasColumnName("SuccessCount")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.FailureCount)
            .HasColumnName("FailureCount")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.LastErrorMessage)
            .HasColumnName("LastErrorMessage")
            .HasMaxLength(1000);

        // Audit
        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.LastModifiedAt)
            .HasColumnName("LastModifiedAt")
            .IsRequired();

        builder.Property(x => x.CreatedBy)
            .HasColumnName("CreatedBy")
            .HasMaxLength(100);

        builder.Property(x => x.ModifiedBy)
            .HasColumnName("ModifiedBy")
            .HasMaxLength(100);

        // Relationships
        builder.HasOne(x => x.Tenant)
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_BackupSchedules_TenantId");

        builder.HasIndex(x => new { x.TenantId, x.IsEnabled })
            .HasDatabaseName("IX_BackupSchedules_TenantId_IsEnabled");

        builder.HasIndex(x => x.HangfireJobId)
            .HasDatabaseName("IX_BackupSchedules_HangfireJobId");
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for EmployeeTraining
/// </summary>
public class EmployeeTrainingConfiguration : IEntityTypeConfiguration<EmployeeTraining>
{
    public void Configure(EntityTypeBuilder<EmployeeTraining> builder)
    {
        builder.ToTable("EmployeeTrainings", "hr");

        builder.HasKey(et => et.Id);

        builder.Property(et => et.TenantId)
            .IsRequired();

        builder.Property(et => et.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(et => et.Score)
            .HasPrecision(5, 2);

        builder.Property(et => et.CertificateNumber)
            .HasMaxLength(100);

        builder.Property(et => et.CertificateUrl)
            .HasMaxLength(500);

        builder.Property(et => et.Feedback)
            .HasMaxLength(2000);

        builder.Property(et => et.FeedbackRating);

        builder.Property(et => et.Notes)
            .HasMaxLength(1000);

        builder.Property(et => et.CancellationReason)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(et => et.Employee)
            .WithMany(e => e.Trainings)
            .HasForeignKey(et => et.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(et => et.Training)
            .WithMany(t => t.Participants)
            .HasForeignKey(et => et.TrainingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(et => et.TenantId);
        builder.HasIndex(et => new { et.TenantId, et.EmployeeId });
        builder.HasIndex(et => new { et.TenantId, et.TrainingId });
        builder.HasIndex(et => new { et.TenantId, et.Status });
        builder.HasIndex(et => new { et.EmployeeId, et.TrainingId }).IsUnique();
    }
}

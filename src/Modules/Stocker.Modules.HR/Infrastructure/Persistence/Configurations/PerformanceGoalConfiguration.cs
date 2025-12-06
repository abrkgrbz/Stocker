using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for PerformanceGoal
/// </summary>
public class PerformanceGoalConfiguration : IEntityTypeConfiguration<PerformanceGoal>
{
    public void Configure(EntityTypeBuilder<PerformanceGoal> builder)
    {
        builder.ToTable("PerformanceGoals", "hr");

        builder.HasKey(pg => pg.Id);

        builder.Property(pg => pg.TenantId)
            .IsRequired();

        builder.Property(pg => pg.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(pg => pg.Description)
            .HasMaxLength(2000);

        builder.Property(pg => pg.Category)
            .HasMaxLength(100);

        builder.Property(pg => pg.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(pg => pg.Achievement)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(pg => pg.Weight)
            .HasPrecision(5, 2);

        builder.Property(pg => pg.Progress)
            .HasPrecision(5, 2);

        builder.Property(pg => pg.Metrics)
            .HasMaxLength(1000);

        builder.Property(pg => pg.Notes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(pg => pg.Employee)
            .WithMany()
            .HasForeignKey(pg => pg.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pg => pg.PerformanceReview)
            .WithMany(pr => pr.PerformanceGoals)
            .HasForeignKey(pg => pg.PerformanceReviewId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(pg => pg.AssignedBy)
            .WithMany()
            .HasForeignKey(pg => pg.AssignedById)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(pg => pg.TenantId);
        builder.HasIndex(pg => new { pg.TenantId, pg.EmployeeId });
        builder.HasIndex(pg => new { pg.TenantId, pg.PerformanceReviewId });
        builder.HasIndex(pg => new { pg.TenantId, pg.Status });
        builder.HasIndex(pg => new { pg.TenantId, pg.DueDate });
    }
}

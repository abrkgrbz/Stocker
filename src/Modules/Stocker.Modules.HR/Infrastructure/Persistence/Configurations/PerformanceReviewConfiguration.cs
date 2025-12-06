using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for PerformanceReview
/// </summary>
public class PerformanceReviewConfiguration : IEntityTypeConfiguration<PerformanceReview>
{
    public void Configure(EntityTypeBuilder<PerformanceReview> builder)
    {
        builder.ToTable("PerformanceReviews", "hr");

        builder.HasKey(pr => pr.Id);

        builder.Property(pr => pr.TenantId)
            .IsRequired();

        builder.Property(pr => pr.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(pr => pr.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(pr => pr.OverallRating)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(pr => pr.Strengths)
            .HasMaxLength(2000);

        builder.Property(pr => pr.AreasForImprovement)
            .HasMaxLength(2000);

        builder.Property(pr => pr.Goals)
            .HasMaxLength(2000);

        builder.Property(pr => pr.Achievements)
            .HasMaxLength(2000);

        builder.Property(pr => pr.ReviewerComments)
            .HasMaxLength(4000);

        builder.Property(pr => pr.EmployeeComments)
            .HasMaxLength(2000);

        builder.Property(pr => pr.RecommendedRaisePercent)
            .HasPrecision(5, 2);

        builder.Property(pr => pr.Notes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(pr => pr.Employee)
            .WithMany(e => e.PerformanceReviews)
            .HasForeignKey(pr => pr.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pr => pr.Reviewer)
            .WithMany()
            .HasForeignKey(pr => pr.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pr => pr.ApprovedBy)
            .WithMany()
            .HasForeignKey(pr => pr.ApprovedById)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(pr => pr.TenantId);
        builder.HasIndex(pr => new { pr.TenantId, pr.EmployeeId });
        builder.HasIndex(pr => new { pr.TenantId, pr.ReviewerId });
        builder.HasIndex(pr => new { pr.TenantId, pr.Status });
        builder.HasIndex(pr => new { pr.TenantId, pr.Year, pr.Quarter });
        builder.HasIndex(pr => new { pr.TenantId, pr.ReviewPeriodStart, pr.ReviewPeriodEnd });
    }
}

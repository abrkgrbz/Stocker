using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for PerformanceReviewCriteria
/// </summary>
public class PerformanceReviewCriteriaConfiguration : IEntityTypeConfiguration<PerformanceReviewCriteria>
{
    public void Configure(EntityTypeBuilder<PerformanceReviewCriteria> builder)
    {
        builder.ToTable("PerformanceReviewCriteria", "hr");

        builder.HasKey(prc => prc.Id);

        builder.Property(prc => prc.TenantId)
            .IsRequired();

        builder.Property(prc => prc.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(prc => prc.Description)
            .HasMaxLength(1000);

        builder.Property(prc => prc.Weight)
            .HasPrecision(5, 2);

        builder.Property(prc => prc.Rating)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(prc => prc.Score)
            .HasPrecision(5, 2);

        builder.Property(prc => prc.Comments)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(prc => prc.PerformanceReview)
            .WithMany(pr => pr.Criteria)
            .HasForeignKey(prc => prc.PerformanceReviewId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(prc => prc.TenantId);
        builder.HasIndex(prc => new { prc.TenantId, prc.PerformanceReviewId });
    }
}

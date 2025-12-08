using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class SupplierEvaluationConfiguration : IEntityTypeConfiguration<SupplierEvaluation>
{
    public void Configure(EntityTypeBuilder<SupplierEvaluation> builder)
    {
        builder.ToTable("SupplierEvaluations");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.EvaluationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.SupplierCode)
            .HasMaxLength(50);

        builder.Property(e => e.SupplierName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.Type)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.PeriodType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.QualityScore)
            .HasPrecision(5, 2);

        builder.Property(e => e.DeliveryScore)
            .HasPrecision(5, 2);

        builder.Property(e => e.PriceScore)
            .HasPrecision(5, 2);

        builder.Property(e => e.ServiceScore)
            .HasPrecision(5, 2);

        builder.Property(e => e.CommunicationScore)
            .HasPrecision(5, 2);

        builder.Property(e => e.OverallScore)
            .HasPrecision(5, 2);

        builder.Property(e => e.QualityWeight)
            .HasPrecision(5, 2);

        builder.Property(e => e.DeliveryWeight)
            .HasPrecision(5, 2);

        builder.Property(e => e.PriceWeight)
            .HasPrecision(5, 2);

        builder.Property(e => e.ServiceWeight)
            .HasPrecision(5, 2);

        builder.Property(e => e.CommunicationWeight)
            .HasPrecision(5, 2);

        builder.Property(e => e.OnTimeDeliveryRate)
            .HasPrecision(5, 2);

        builder.Property(e => e.AcceptanceRate)
            .HasPrecision(5, 2);

        builder.Property(e => e.AverageLeadTimeDays)
            .HasPrecision(10, 2);

        builder.Property(e => e.ReturnRate)
            .HasPrecision(5, 2);

        builder.Property(e => e.TotalPurchaseAmount)
            .HasPrecision(18, 4);

        builder.Property(e => e.AverageOrderValue)
            .HasPrecision(18, 4);

        builder.Property(e => e.PreviousOverallScore)
            .HasPrecision(5, 2);

        builder.Property(e => e.ScoreChange)
            .HasPrecision(5, 2);

        builder.Property(e => e.ScoreTrend)
            .HasMaxLength(20);

        builder.Property(e => e.Rating)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.EvaluatedByName)
            .HasMaxLength(200);

        builder.Property(e => e.Strengths)
            .HasMaxLength(2000);

        builder.Property(e => e.Weaknesses)
            .HasMaxLength(2000);

        builder.Property(e => e.ImprovementAreas)
            .HasMaxLength(2000);

        builder.Property(e => e.Recommendations)
            .HasMaxLength(2000);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.FollowUpNotes)
            .HasMaxLength(1000);

        builder.HasMany(e => e.Criteria)
            .WithOne()
            .HasForeignKey(c => c.EvaluationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.History)
            .WithOne()
            .HasForeignKey(h => h.SupplierId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(e => new { e.TenantId, e.EvaluationNumber }).IsUnique();
        builder.HasIndex(e => new { e.TenantId, e.SupplierId });
        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => new { e.TenantId, e.Year, e.Quarter });
        builder.HasIndex(e => new { e.TenantId, e.Rating });
    }
}

public class SupplierEvaluationCriteriaConfiguration : IEntityTypeConfiguration<SupplierEvaluationCriteria>
{
    public void Configure(EntityTypeBuilder<SupplierEvaluationCriteria> builder)
    {
        builder.ToTable("SupplierEvaluationCriteria");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Category)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.Property(c => c.Weight)
            .HasPrecision(5, 2);

        builder.Property(c => c.Score)
            .HasPrecision(5, 2);

        builder.Property(c => c.WeightedScore)
            .HasPrecision(5, 2);

        builder.Property(c => c.Evidence)
            .HasMaxLength(1000);

        builder.Property(c => c.Notes)
            .HasMaxLength(500);

        builder.HasIndex(c => new { c.TenantId, c.EvaluationId });
    }
}

public class SupplierEvaluationHistoryConfiguration : IEntityTypeConfiguration<SupplierEvaluationHistory>
{
    public void Configure(EntityTypeBuilder<SupplierEvaluationHistory> builder)
    {
        builder.ToTable("SupplierEvaluationHistory");

        builder.HasKey(h => h.Id);

        builder.Property(h => h.OverallScore)
            .HasPrecision(5, 2);

        builder.Property(h => h.QualityScore)
            .HasPrecision(5, 2);

        builder.Property(h => h.DeliveryScore)
            .HasPrecision(5, 2);

        builder.Property(h => h.PriceScore)
            .HasPrecision(5, 2);

        builder.Property(h => h.ServiceScore)
            .HasPrecision(5, 2);

        builder.Property(h => h.CommunicationScore)
            .HasPrecision(5, 2);

        builder.Property(h => h.Rating)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.HasIndex(h => new { h.TenantId, h.SupplierId });
        builder.HasIndex(h => new { h.TenantId, h.Year, h.Quarter });
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for PromotionUsage
/// </summary>
public class PromotionUsageConfiguration : IEntityTypeConfiguration<PromotionUsage>
{
    public void Configure(EntityTypeBuilder<PromotionUsage> builder)
    {
        builder.ToTable("PromotionUsages", "sales");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.PromotionId)
            .IsRequired();

        builder.Property(e => e.CustomerId)
            .IsRequired();

        builder.Property(e => e.OrderId)
            .IsRequired();

        builder.Property(e => e.DiscountApplied)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(e => e.UsedAt)
            .IsRequired();

        builder.Property(e => e.TenantId)
            .IsRequired();

        // Indexes for query performance
        builder.HasIndex(e => new { e.TenantId, e.PromotionId, e.CustomerId })
            .HasDatabaseName("IX_PromotionUsages_TenantId_PromotionId_CustomerId");

        builder.HasIndex(e => new { e.TenantId, e.PromotionId, e.OrderId })
            .HasDatabaseName("IX_PromotionUsages_TenantId_PromotionId_OrderId")
            .IsUnique(); // Prevent duplicate usage records for same order

        builder.HasIndex(e => new { e.TenantId, e.CustomerId })
            .HasDatabaseName("IX_PromotionUsages_TenantId_CustomerId");

        // Global query filter for multi-tenancy
        // Note: This filter is commented out because the base class may handle it
        // builder.HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
    }
}

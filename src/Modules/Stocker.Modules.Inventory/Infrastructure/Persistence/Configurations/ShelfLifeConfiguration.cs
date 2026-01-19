using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for ShelfLife
/// </summary>
public class ShelfLifeConfiguration : IEntityTypeConfiguration<ShelfLife>
{
    public void Configure(EntityTypeBuilder<ShelfLife> builder)
    {
        builder.ToTable("ShelfLives", "inventory");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.ShelfLifeType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(s => s.TotalShelfLifeDays)
            .IsRequired();

        builder.Property(s => s.IsActive)
            .IsRequired();

        builder.Property(s => s.MinReceivingShelfLifeDays)
            .IsRequired();

        builder.Property(s => s.MinReceivingShelfLifePercent)
            .HasPrecision(5, 2);

        builder.Property(s => s.ReceivingRuleType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(s => s.MinSalesShelfLifeDays)
            .IsRequired();

        builder.Property(s => s.MinSalesShelfLifePercent)
            .HasPrecision(5, 2);

        builder.Property(s => s.SalesRuleType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(s => s.AlertThresholdDays)
            .IsRequired();

        builder.Property(s => s.AlertThresholdPercent)
            .HasPrecision(5, 2);

        builder.Property(s => s.CriticalThresholdDays)
            .IsRequired();

        builder.Property(s => s.CriticalThresholdPercent)
            .HasPrecision(5, 2);

        builder.Property(s => s.ExpiryAction)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(s => s.RequiredZoneType)
            .HasConversion<int>();

        builder.Property(s => s.StorageConditions)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(s => s.Product)
            .WithMany()
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => new { s.TenantId, s.ProductId }).IsUnique();
        builder.HasIndex(s => new { s.TenantId, s.IsActive });
        builder.HasIndex(s => new { s.TenantId, s.ShelfLifeType });
        builder.HasIndex(s => new { s.TenantId, s.RequiresSpecialStorage });
    }
}

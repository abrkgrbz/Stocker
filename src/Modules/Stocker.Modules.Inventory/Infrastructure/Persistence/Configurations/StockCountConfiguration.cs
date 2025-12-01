using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for StockCount
/// </summary>
public class StockCountConfiguration : IEntityTypeConfiguration<StockCount>
{
    public void Configure(EntityTypeBuilder<StockCount> builder)
    {
        builder.ToTable("StockCounts", "inventory");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.CountNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.CountDate)
            .IsRequired();

        builder.Property(c => c.Status)
            .IsRequired();

        builder.Property(c => c.CountType)
            .IsRequired();

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.Property(c => c.Notes)
            .HasMaxLength(1000);

        builder.Property(c => c.CancellationReason)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(c => c.Warehouse)
            .WithMany()
            .HasForeignKey(c => c.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Location)
            .WithMany()
            .HasForeignKey(c => c.LocationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(c => c.Items)
            .WithOne(i => i.StockCount)
            .HasForeignKey(i => i.StockCountId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => new { c.TenantId, c.CountNumber }).IsUnique();
        builder.HasIndex(c => new { c.TenantId, c.WarehouseId });
        builder.HasIndex(c => new { c.TenantId, c.Status });
        builder.HasIndex(c => new { c.TenantId, c.CountDate });
    }
}

/// <summary>
/// Entity configuration for StockCountItem
/// </summary>
public class StockCountItemConfiguration : IEntityTypeConfiguration<StockCountItem>
{
    public void Configure(EntityTypeBuilder<StockCountItem> builder)
    {
        builder.ToTable("StockCountItems", "inventory");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.SystemQuantity)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(i => i.CountedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.SerialNumber)
            .HasMaxLength(50);

        builder.Property(i => i.LotNumber)
            .HasMaxLength(50);

        builder.Property(i => i.Notes)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Location)
            .WithMany()
            .HasForeignKey(i => i.LocationId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.TenantId, i.StockCountId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}

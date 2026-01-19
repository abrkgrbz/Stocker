using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for InventoryAdjustment
/// </summary>
public class InventoryAdjustmentConfiguration : IEntityTypeConfiguration<InventoryAdjustment>
{
    public void Configure(EntityTypeBuilder<InventoryAdjustment> builder)
    {
        builder.ToTable("InventoryAdjustments", "inventory");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.TenantId)
            .IsRequired();

        builder.Property(a => a.AdjustmentNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.AdjustmentDate)
            .IsRequired();

        builder.Property(a => a.AdjustmentType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(a => a.Reason)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(a => a.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(a => a.Description)
            .HasMaxLength(1000);

        builder.Property(a => a.ReferenceNumber)
            .HasMaxLength(100);

        builder.Property(a => a.ReferenceType)
            .HasMaxLength(50);

        builder.Property(a => a.TotalCostImpact)
            .HasPrecision(18, 4);

        builder.Property(a => a.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(a => a.ApprovedBy)
            .HasMaxLength(200);

        builder.Property(a => a.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(a => a.InternalNotes)
            .HasMaxLength(2000);

        builder.Property(a => a.AccountingNotes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(a => a.Warehouse)
            .WithMany()
            .HasForeignKey(a => a.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Location)
            .WithMany()
            .HasForeignKey(a => a.LocationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(a => a.StockCount)
            .WithMany()
            .HasForeignKey(a => a.StockCountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(a => a.Items)
            .WithOne(i => i.InventoryAdjustment)
            .HasForeignKey(i => i.InventoryAdjustmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => new { a.TenantId, a.AdjustmentNumber }).IsUnique();
        builder.HasIndex(a => new { a.TenantId, a.WarehouseId });
        builder.HasIndex(a => new { a.TenantId, a.Status });
        builder.HasIndex(a => new { a.TenantId, a.AdjustmentDate });
        builder.HasIndex(a => new { a.TenantId, a.AdjustmentType });
        builder.HasIndex(a => new { a.TenantId, a.Reason });
        builder.HasIndex(a => new { a.TenantId, a.StockCountId })
            .HasFilter("[StockCountId] IS NOT NULL");
    }
}

/// <summary>
/// Entity configuration for InventoryAdjustmentItem
/// </summary>
public class InventoryAdjustmentItemConfiguration : IEntityTypeConfiguration<InventoryAdjustmentItem>
{
    public void Configure(EntityTypeBuilder<InventoryAdjustmentItem> builder)
    {
        builder.ToTable("InventoryAdjustmentItems", "inventory");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.SystemQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.ActualQuantity)
            .HasPrecision(18, 4);

        // VarianceQuantity is a computed property (ActualQuantity - SystemQuantity)
        builder.Ignore(i => i.VarianceQuantity);

        builder.Property(i => i.UnitCost)
            .HasPrecision(18, 4);

        // CostImpact is a computed property (VarianceQuantity * UnitCost)
        builder.Ignore(i => i.CostImpact);

        builder.Property(i => i.LotNumber)
            .HasMaxLength(100);

        builder.Property(i => i.SerialNumber)
            .HasMaxLength(100);

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.TenantId, i.InventoryAdjustmentId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}

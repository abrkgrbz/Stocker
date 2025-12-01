using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for StockTransfer
/// </summary>
public class StockTransferConfiguration : IEntityTypeConfiguration<StockTransfer>
{
    public void Configure(EntityTypeBuilder<StockTransfer> builder)
    {
        builder.ToTable("StockTransfers", "inventory");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TenantId)
            .IsRequired();

        builder.Property(t => t.TransferNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Status)
            .IsRequired();

        builder.Property(t => t.TransferType)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasMaxLength(500);

        builder.Property(t => t.Notes)
            .HasMaxLength(1000);

        builder.Property(t => t.CancellationReason)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(t => t.SourceWarehouse)
            .WithMany()
            .HasForeignKey(t => t.SourceWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.DestinationWarehouse)
            .WithMany()
            .HasForeignKey(t => t.DestinationWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(t => t.Items)
            .WithOne(i => i.StockTransfer)
            .HasForeignKey(i => i.StockTransferId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(t => t.TenantId);
        builder.HasIndex(t => new { t.TenantId, t.TransferNumber }).IsUnique();
        builder.HasIndex(t => new { t.TenantId, t.SourceWarehouseId });
        builder.HasIndex(t => new { t.TenantId, t.DestinationWarehouseId });
        builder.HasIndex(t => new { t.TenantId, t.Status });
        builder.HasIndex(t => new { t.TenantId, t.TransferDate });
    }
}

/// <summary>
/// Entity configuration for StockTransferItem
/// </summary>
public class StockTransferItemConfiguration : IEntityTypeConfiguration<StockTransferItem>
{
    public void Configure(EntityTypeBuilder<StockTransferItem> builder)
    {
        builder.ToTable("StockTransferItems", "inventory");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.RequestedQuantity)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(i => i.ShippedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.ReceivedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.DamagedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.LotNumber)
            .HasMaxLength(50);

        builder.Property(i => i.SerialNumber)
            .HasMaxLength(50);

        builder.Property(i => i.Notes)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.SourceLocation)
            .WithMany()
            .HasForeignKey(i => i.SourceLocationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(i => i.DestinationLocation)
            .WithMany()
            .HasForeignKey(i => i.DestinationLocationId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.TenantId, i.StockTransferId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for ConsignmentStock
/// </summary>
public class ConsignmentStockConfiguration : IEntityTypeConfiguration<ConsignmentStock>
{
    public void Configure(EntityTypeBuilder<ConsignmentStock> builder)
    {
        builder.ToTable("ConsignmentStocks", "inventory");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.ConsignmentNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(c => c.AgreementDate)
            .IsRequired();

        builder.Property(c => c.LotNumber)
            .HasMaxLength(100);

        builder.Property(c => c.InitialQuantity)
            .HasPrecision(18, 4);

        builder.Property(c => c.CurrentQuantity)
            .HasPrecision(18, 4);

        builder.Property(c => c.SoldQuantity)
            .HasPrecision(18, 4);

        builder.Property(c => c.ReturnedQuantity)
            .HasPrecision(18, 4);

        builder.Property(c => c.DamagedQuantity)
            .HasPrecision(18, 4);

        builder.Property(c => c.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(c => c.UnitCost)
            .HasPrecision(18, 4);

        builder.Property(c => c.SellingPrice)
            .HasPrecision(18, 4);

        builder.Property(c => c.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(c => c.CommissionRate)
            .HasPrecision(5, 2);

        builder.Property(c => c.TotalSalesAmount)
            .HasPrecision(18, 4);

        builder.Property(c => c.PaidAmount)
            .HasPrecision(18, 4);

        builder.Property(c => c.AgreementNotes)
            .HasMaxLength(2000);

        builder.Property(c => c.InternalNotes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(c => c.Supplier)
            .WithMany()
            .HasForeignKey(c => c.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Product)
            .WithMany()
            .HasForeignKey(c => c.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Warehouse)
            .WithMany()
            .HasForeignKey(c => c.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Location)
            .WithMany()
            .HasForeignKey(c => c.LocationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(c => c.Movements)
            .WithOne(m => m.ConsignmentStock)
            .HasForeignKey(m => m.ConsignmentStockId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => new { c.TenantId, c.ConsignmentNumber }).IsUnique();
        builder.HasIndex(c => new { c.TenantId, c.SupplierId });
        builder.HasIndex(c => new { c.TenantId, c.ProductId });
        builder.HasIndex(c => new { c.TenantId, c.WarehouseId });
        builder.HasIndex(c => new { c.TenantId, c.Status });
        builder.HasIndex(c => new { c.TenantId, c.AgreementDate });
        builder.HasIndex(c => new { c.TenantId, c.NextReconciliationDate });
    }
}

/// <summary>
/// Entity configuration for ConsignmentStockMovement
/// </summary>
public class ConsignmentStockMovementConfiguration : IEntityTypeConfiguration<ConsignmentStockMovement>
{
    public void Configure(EntityTypeBuilder<ConsignmentStockMovement> builder)
    {
        builder.ToTable("ConsignmentStockMovements", "inventory");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.TenantId)
            .IsRequired();

        builder.Property(m => m.MovementType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(m => m.Quantity)
            .HasPrecision(18, 4);

        builder.Property(m => m.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(m => m.ReferenceNumber)
            .HasMaxLength(100);

        builder.Property(m => m.Notes)
            .HasMaxLength(1000);

        builder.Property(m => m.MovementDate)
            .IsRequired();

        // Indexes
        builder.HasIndex(m => m.TenantId);
        builder.HasIndex(m => new { m.TenantId, m.ConsignmentStockId });
        builder.HasIndex(m => new { m.TenantId, m.MovementDate });
        builder.HasIndex(m => new { m.TenantId, m.MovementType });
    }
}

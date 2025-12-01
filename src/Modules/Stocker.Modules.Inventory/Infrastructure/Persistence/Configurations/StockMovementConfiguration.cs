using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for StockMovement
/// </summary>
public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("StockMovements", "inventory");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.TenantId)
            .IsRequired();

        builder.Property(m => m.DocumentNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(m => m.MovementDate)
            .IsRequired();

        builder.Property(m => m.MovementType)
            .IsRequired();

        builder.Property(m => m.Quantity)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(m => m.UnitCost)
            .HasPrecision(18, 4);

        builder.Property(m => m.SerialNumber)
            .HasMaxLength(50);

        builder.Property(m => m.LotNumber)
            .HasMaxLength(50);

        builder.Property(m => m.ReferenceDocumentType)
            .HasMaxLength(50);

        builder.Property(m => m.ReferenceDocumentNumber)
            .HasMaxLength(50);

        builder.Property(m => m.Description)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(m => m.FromLocation)
            .WithMany()
            .HasForeignKey(m => m.FromLocationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.ToLocation)
            .WithMany()
            .HasForeignKey(m => m.ToLocationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.ReversedMovement)
            .WithMany()
            .HasForeignKey(m => m.ReversedMovementId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(m => m.TenantId);
        builder.HasIndex(m => new { m.TenantId, m.DocumentNumber });
        builder.HasIndex(m => new { m.TenantId, m.ProductId });
        builder.HasIndex(m => new { m.TenantId, m.WarehouseId });
        builder.HasIndex(m => new { m.TenantId, m.MovementDate });
        builder.HasIndex(m => new { m.TenantId, m.MovementType });
        builder.HasIndex(m => new { m.TenantId, m.ReferenceDocumentType, m.ReferenceDocumentNumber });
    }
}

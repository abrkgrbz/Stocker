using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for StockReservation
/// </summary>
public class StockReservationConfiguration : IEntityTypeConfiguration<StockReservation>
{
    public void Configure(EntityTypeBuilder<StockReservation> builder)
    {
        builder.ToTable("StockReservations", "inventory");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.TenantId)
            .IsRequired();

        builder.Property(r => r.ReservationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.Quantity)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(r => r.FulfilledQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.Status)
            .IsRequired();

        builder.Property(r => r.ReservationType)
            .IsRequired();

        builder.Property(r => r.ReferenceDocumentType)
            .HasMaxLength(50);

        builder.Property(r => r.ReferenceDocumentNumber)
            .HasMaxLength(50);

        builder.Property(r => r.Notes)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(r => r.Product)
            .WithMany()
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Warehouse)
            .WithMany()
            .HasForeignKey(r => r.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Location)
            .WithMany()
            .HasForeignKey(r => r.LocationId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(r => r.TenantId);
        builder.HasIndex(r => new { r.TenantId, r.ReservationNumber }).IsUnique();
        builder.HasIndex(r => new { r.TenantId, r.ProductId, r.WarehouseId });
        builder.HasIndex(r => new { r.TenantId, r.Status });
        builder.HasIndex(r => new { r.TenantId, r.ReservationType, r.ReferenceDocumentId });
        builder.HasIndex(r => new { r.TenantId, r.ExpirationDate });
    }
}

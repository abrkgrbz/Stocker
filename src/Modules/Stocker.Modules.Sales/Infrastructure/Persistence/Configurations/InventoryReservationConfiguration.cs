using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class InventoryReservationConfiguration : IEntityTypeConfiguration<InventoryReservation>
{
    public void Configure(EntityTypeBuilder<InventoryReservation> builder)
    {
        builder.ToTable("InventoryReservations", "sales");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReservationNumber)
            .IsRequired()
            .HasMaxLength(50);

        // Product
        builder.Property(r => r.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.WarehouseCode)
            .HasMaxLength(20);

        // Quantity
        builder.Property(r => r.ReservedQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.AllocatedQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.Unit)
            .HasMaxLength(20)
            .HasDefaultValue("Adet");

        // Lot/Serial
        builder.Property(r => r.LotNumber)
            .HasMaxLength(50);

        builder.Property(r => r.SerialNumber)
            .HasMaxLength(100);

        // Source Document
        builder.Property(r => r.Source)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(r => r.SalesOrderNumber)
            .HasMaxLength(50);

        // Status
        builder.Property(r => r.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(r => r.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Audit
        builder.Property(r => r.ReservedByName)
            .HasMaxLength(100);

        builder.Property(r => r.Notes)
            .HasMaxLength(1000);

        // Indexes
        builder.HasIndex(r => r.TenantId);
        builder.HasIndex(r => r.ReservationNumber);
        builder.HasIndex(r => new { r.TenantId, r.ReservationNumber }).IsUnique();
        builder.HasIndex(r => r.ProductId);
        builder.HasIndex(r => new { r.TenantId, r.ProductId, r.Status });
        builder.HasIndex(r => r.SalesOrderId);
        builder.HasIndex(r => r.SalesOrderItemId);
        builder.HasIndex(r => r.OpportunityId);
        builder.HasIndex(r => r.WarehouseId);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.ReservedUntil);
        builder.HasIndex(r => new { r.TenantId, r.Status, r.ReservedUntil });
    }
}

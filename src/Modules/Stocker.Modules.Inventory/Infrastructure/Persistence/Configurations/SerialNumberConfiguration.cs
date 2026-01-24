using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for SerialNumber
/// </summary>
public class SerialNumberConfiguration : IEntityTypeConfiguration<SerialNumber>
{
    public void Configure(EntityTypeBuilder<SerialNumber> builder)
    {
        builder.ToTable("SerialNumbers", "inventory");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.Serial)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(s => s.Notes)
            .HasMaxLength(2000);

        builder.Property(s => s.BatchNumber)
            .HasMaxLength(100);

        builder.Property(s => s.SupplierSerial)
            .HasMaxLength(100);

        // Relationships
        builder.HasOne(s => s.Product)
            .WithMany(p => p.SerialNumbers)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Warehouse)
            .WithMany()
            .HasForeignKey(s => s.WarehouseId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.Location)
            .WithMany()
            .HasForeignKey(s => s.LocationId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => new { s.TenantId, s.Serial }).IsUnique();
        builder.HasIndex(s => new { s.TenantId, s.ProductId });
        builder.HasIndex(s => new { s.TenantId, s.ProductId, s.Serial });
        builder.HasIndex(s => new { s.TenantId, s.Status });
        builder.HasIndex(s => new { s.TenantId, s.WarehouseId })
            .HasFilter("\"WarehouseId\" IS NOT NULL");
        builder.HasIndex(s => new { s.TenantId, s.CustomerId })
            .HasFilter("\"CustomerId\" IS NOT NULL");
        builder.HasIndex(s => new { s.TenantId, s.SalesOrderId })
            .HasFilter("\"SalesOrderId\" IS NOT NULL");
        builder.HasIndex(s => new { s.TenantId, s.BatchNumber })
            .HasFilter("\"BatchNumber\" IS NOT NULL");
        builder.HasIndex(s => new { s.TenantId, s.WarrantyEndDate })
            .HasFilter("\"WarrantyEndDate\" IS NOT NULL");
    }
}

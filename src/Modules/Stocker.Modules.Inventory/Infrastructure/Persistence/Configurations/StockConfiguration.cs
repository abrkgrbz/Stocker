using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Stock
/// </summary>
public class StockConfiguration : IEntityTypeConfiguration<Stock>
{
    public void Configure(EntityTypeBuilder<Stock> builder)
    {
        builder.ToTable("Stocks", "inventory");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.Quantity)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(s => s.ReservedQuantity)
            .HasPrecision(18, 4);

        // Database-level constraints to prevent negative quantities
        builder.ToTable(t =>
        {
            t.HasCheckConstraint("CK_Stocks_Quantity_NonNegative", "\"Quantity\" >= 0");
            t.HasCheckConstraint("CK_Stocks_ReservedQuantity_NonNegative", "\"ReservedQuantity\" >= 0");
        });

        // AvailableQuantity is a computed property in entity, not stored in DB
        builder.Ignore(s => s.AvailableQuantity);

        builder.Property(s => s.LotNumber)
            .HasMaxLength(50);

        builder.Property(s => s.SerialNumber)
            .HasMaxLength(50);

        // Relationships
        builder.HasOne(s => s.Location)
            .WithMany()
            .HasForeignKey(s => s.LocationId)
            .OnDelete(DeleteBehavior.SetNull);

        // Variant relationship for variant-level stock tracking
        builder.HasOne(s => s.ProductVariant)
            .WithMany(v => v.Stocks)
            .HasForeignKey(s => s.ProductVariantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(s => s.TenantId);

        // Unique constraint updated to include ProductVariantId
        // This ensures unique stock records per Product+Warehouse+Location+Variant combination
        builder.HasIndex(s => new { s.TenantId, s.ProductId, s.WarehouseId, s.LocationId, s.ProductVariantId })
            .IsUnique()
            .HasDatabaseName("IX_Stocks_Tenant_Product_Warehouse_Location_Variant");

        builder.HasIndex(s => new { s.TenantId, s.ProductId });
        builder.HasIndex(s => new { s.TenantId, s.WarehouseId });
        builder.HasIndex(s => new { s.TenantId, s.LocationId });
        builder.HasIndex(s => new { s.TenantId, s.ProductVariantId })
            .HasDatabaseName("IX_Stocks_Tenant_ProductVariant");
        builder.HasIndex(s => new { s.TenantId, s.LotNumber });
        builder.HasIndex(s => new { s.TenantId, s.SerialNumber });
        builder.HasIndex(s => new { s.TenantId, s.ExpiryDate });
    }
}

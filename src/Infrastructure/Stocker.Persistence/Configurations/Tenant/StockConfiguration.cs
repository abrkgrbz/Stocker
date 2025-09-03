using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class StockConfiguration : IEntityTypeConfiguration<Stock>
{
    public void Configure(EntityTypeBuilder<Stock> builder)
    {
        builder.ToTable("Stocks", "inventory");

        builder.HasKey(s => s.Id);

        builder.HasIndex(s => new { s.TenantId, s.ProductId, s.WarehouseId })
            .IsUnique();

        builder.Property(s => s.Location)
            .HasMaxLength(200);

        builder.Property(s => s.Quantity)
            .HasPrecision(18, 3);

        builder.Property(s => s.AvailableQuantity)
            .HasPrecision(18, 3);

        builder.Property(s => s.ReservedQuantity)
            .HasPrecision(18, 3);

        builder.Property(s => s.MinimumStock)
            .HasPrecision(18, 3);

        builder.Property(s => s.MaximumStock)
            .HasPrecision(18, 3);

        builder.Property(s => s.BatchNumber)
            .HasMaxLength(100);

        builder.Property(s => s.SerialNumber)
            .HasMaxLength(100);

        // Relationships
        builder.HasOne(s => s.Product)
            .WithMany(p => p.Stocks)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Warehouse)
            .WithMany(w => w.Stocks)
            .HasForeignKey(s => s.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filters
        builder.HasQueryFilter(s => s.TenantId == EF.Property<Guid>(s, "TenantId"));
    }
}
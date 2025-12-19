using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Location (Warehouse Location)
/// </summary>
public class LocationConfiguration : IEntityTypeConfiguration<Location>
{
    public void Configure(EntityTypeBuilder<Location> builder)
    {
        builder.ToTable("Locations", "inventory");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.TenantId)
            .IsRequired();

        builder.Property(l => l.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(l => l.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.Description)
            .HasMaxLength(500);

        builder.Property(l => l.Aisle)
            .HasMaxLength(20);

        builder.Property(l => l.Shelf)
            .HasMaxLength(20);

        builder.Property(l => l.Bin)
            .HasMaxLength(20);

        builder.Property(l => l.Capacity)
            .HasPrecision(18, 4);

        builder.Property(l => l.UsedCapacity)
            .HasPrecision(18, 4);

        // Relationship to Warehouse
        builder.HasOne(l => l.Warehouse)
            .WithMany(w => w.Locations)
            .HasForeignKey(l => l.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relationship to WarehouseZone
        builder.HasOne(l => l.WarehouseZone)
            .WithMany(z => z.Locations)
            .HasForeignKey(l => l.WarehouseZoneId)
            .OnDelete(DeleteBehavior.SetNull);

        // Relationship to Stocks
        builder.HasMany(l => l.Stocks)
            .WithOne(s => s.Location)
            .HasForeignKey(s => s.LocationId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(l => l.TenantId);
        builder.HasIndex(l => new { l.TenantId, l.WarehouseId, l.Code }).IsUnique();
        builder.HasIndex(l => new { l.TenantId, l.WarehouseId });
        builder.HasIndex(l => new { l.TenantId, l.WarehouseZoneId });
        builder.HasIndex(l => new { l.TenantId, l.IsActive });
    }
}

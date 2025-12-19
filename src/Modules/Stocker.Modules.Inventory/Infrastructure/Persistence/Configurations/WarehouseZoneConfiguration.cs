using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for WarehouseZone
/// </summary>
public class WarehouseZoneConfiguration : IEntityTypeConfiguration<WarehouseZone>
{
    public void Configure(EntityTypeBuilder<WarehouseZone> builder)
    {
        builder.ToTable("WarehouseZones", "inventory");

        builder.HasKey(z => z.Id);

        builder.Property(z => z.TenantId)
            .IsRequired();

        builder.Property(z => z.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(z => z.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(z => z.Description)
            .HasMaxLength(500);

        builder.Property(z => z.ZoneType)
            .IsRequired()
            .HasConversion<int>();

        // Temperature Control
        builder.Property(z => z.MinTemperature)
            .HasPrecision(5, 2);

        builder.Property(z => z.MaxTemperature)
            .HasPrecision(5, 2);

        builder.Property(z => z.TargetTemperature)
            .HasPrecision(5, 2);

        // Humidity Control
        builder.Property(z => z.MinHumidity)
            .HasPrecision(5, 2);

        builder.Property(z => z.MaxHumidity)
            .HasPrecision(5, 2);

        // Safety and Hazard
        builder.Property(z => z.HazardClass)
            .HasMaxLength(50);

        builder.Property(z => z.UnNumber)
            .HasMaxLength(20);

        // Capacity Information
        builder.Property(z => z.TotalArea)
            .HasPrecision(18, 2);

        builder.Property(z => z.UsableArea)
            .HasPrecision(18, 2);

        builder.Property(z => z.MaxHeight)
            .HasPrecision(10, 2);

        builder.Property(z => z.MaxWeightPerArea)
            .HasPrecision(18, 2);

        // Relationship to Warehouse
        builder.HasOne(z => z.Warehouse)
            .WithMany(w => w.Zones)
            .HasForeignKey(z => z.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relationship to Locations
        builder.HasMany(z => z.Locations)
            .WithOne(l => l.WarehouseZone)
            .HasForeignKey(l => l.WarehouseZoneId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(z => z.TenantId);
        builder.HasIndex(z => new { z.TenantId, z.WarehouseId, z.Code }).IsUnique();
        builder.HasIndex(z => new { z.TenantId, z.WarehouseId });
        builder.HasIndex(z => new { z.TenantId, z.IsActive });
        builder.HasIndex(z => new { z.TenantId, z.ZoneType });
    }
}

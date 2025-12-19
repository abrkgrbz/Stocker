using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Warehouse
/// </summary>
public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("Warehouses", "inventory");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.TenantId)
            .IsRequired();

        builder.Property(w => w.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.Description)
            .HasMaxLength(500);

        builder.OwnsOne(w => w.Address, a =>
        {
            a.Property(ad => ad.Street).HasColumnName("Street").HasMaxLength(200);
            a.Property(ad => ad.Building).HasColumnName("Building").HasMaxLength(50);
            a.Property(ad => ad.Floor).HasColumnName("Floor").HasMaxLength(20);
            a.Property(ad => ad.Apartment).HasColumnName("Apartment").HasMaxLength(20);
            a.Property(ad => ad.City).HasColumnName("City").HasMaxLength(100);
            a.Property(ad => ad.State).HasColumnName("State").HasMaxLength(100);
            a.Property(ad => ad.Country).HasColumnName("Country").HasMaxLength(100);
            a.Property(ad => ad.PostalCode).HasColumnName("PostalCode").HasMaxLength(20);
        });

        builder.Property(w => w.Manager)
            .HasMaxLength(100);

        builder.OwnsOne(w => w.Phone, p =>
        {
            p.Property(ph => ph.Value)
                .HasColumnName("Phone")
                .HasMaxLength(50);
        });

        builder.Property(w => w.TotalArea)
            .HasPrecision(18, 2);

        // Relationships
        builder.HasMany(w => w.Locations)
            .WithOne(l => l.Warehouse)
            .HasForeignKey(l => l.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Zones)
            .WithOne(z => z.Warehouse)
            .HasForeignKey(z => z.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Stocks)
            .WithOne(s => s.Warehouse)
            .HasForeignKey(s => s.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(w => w.StockMovements)
            .WithOne(m => m.Warehouse)
            .HasForeignKey(m => m.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(w => w.TenantId);
        builder.HasIndex(w => new { w.TenantId, w.Code }).IsUnique();
        builder.HasIndex(w => new { w.TenantId, w.IsActive });
        builder.HasIndex(w => new { w.TenantId, w.BranchId });
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("Warehouses", "inventory");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(w => new { w.TenantId, w.Code })
            .IsUnique();

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.Description)
            .HasMaxLength(500);

        // Configure Address value object
        builder.OwnsOne(w => w.Address, address =>
        {
            address.Property(a => a.Street).HasMaxLength(200).HasColumnName("Street");
            address.Property(a => a.City).HasMaxLength(100).HasColumnName("City");
            address.Property(a => a.State).HasMaxLength(100).HasColumnName("State");
            address.Property(a => a.PostalCode).HasMaxLength(20).HasColumnName("PostalCode");
            address.Property(a => a.Country).HasMaxLength(100).HasColumnName("Country");
        });

        builder.Property(w => w.Phone)
            .HasMaxLength(50);

        builder.Property(w => w.Email)
            .HasMaxLength(200);

        builder.Property(w => w.Manager)
            .HasMaxLength(200);

        builder.Property(w => w.Capacity)
            .HasPrecision(18, 3);

        builder.Property(w => w.CapacityUnit)
            .HasMaxLength(50);

        builder.Property(w => w.Type)
            .IsRequired();

        // Indexes
        builder.HasIndex(w => w.IsActive);
        builder.HasIndex(w => w.Type);

        // Relationships
        builder.HasOne(w => w.Branch)
            .WithMany()
            .HasForeignKey(w => w.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(w => w.Stocks)
            .WithOne(s => s.Warehouse)
            .HasForeignKey(s => s.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(w => w.OutgoingMovements)
            .WithOne(m => m.FromWarehouse)
            .HasForeignKey(m => m.FromWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(w => w.IncomingMovements)
            .WithOne(m => m.ToWarehouse)
            .HasForeignKey(m => m.ToWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filters
        builder.HasQueryFilter(w => w.TenantId == EF.Property<Guid>(w, "TenantId"));
    }
}
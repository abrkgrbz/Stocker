using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products", "inventory");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(p => new { p.TenantId, p.Code })
            .IsUnique();

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Barcode)
            .HasMaxLength(50);

        builder.HasIndex(p => new { p.TenantId, p.Barcode })
            .IsUnique()
            .HasFilter("[Barcode] IS NOT NULL");

        builder.Property(p => p.SKU)
            .HasMaxLength(50);

        builder.HasIndex(p => new { p.TenantId, p.SKU })
            .IsUnique()
            .HasFilter("[SKU] IS NOT NULL");

        builder.Property(p => p.Category)
            .IsRequired();

        builder.Property(p => p.Brand)
            .HasMaxLength(100);

        builder.Property(p => p.Model)
            .HasMaxLength(100);

        builder.Property(p => p.Unit)
            .IsRequired();

        builder.Property(p => p.UnitPrice)
            .HasPrecision(18, 2);

        builder.Property(p => p.CostPrice)
            .HasPrecision(18, 2);

        builder.Property(p => p.SalePrice)
            .HasPrecision(18, 2);

        builder.Property(p => p.VatRate)
            .HasPrecision(5, 2);

        builder.Property(p => p.Weight)
            .HasPrecision(18, 3);

        builder.Property(p => p.Dimensions)
            .HasMaxLength(100);

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500);

        builder.Property(p => p.Location)
            .HasMaxLength(200);

        builder.Property(p => p.Notes)
            .HasMaxLength(1000);

        // Relationships
        builder.HasMany(p => p.Stocks)
            .WithOne(s => s.Product)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.StockMovements)
            .WithOne(m => m.Product)
            .HasForeignKey(m => m.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filters
        builder.HasQueryFilter(p => p.TenantId == EF.Property<Guid>(p, "TenantId"));
    }
}
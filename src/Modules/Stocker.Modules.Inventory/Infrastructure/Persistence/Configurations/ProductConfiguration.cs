using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Product
/// </summary>
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products", "inventory");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Property(p => p.Barcode)
            .HasMaxLength(50);

        builder.Property(p => p.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.SKU)
            .HasMaxLength(100);

        builder.Property(p => p.ProductType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(p => p.UnitId)
            .IsRequired();

        builder.Property(p => p.ReorderQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.LeadTimeDays);

        builder.Property(p => p.Weight)
            .HasPrecision(18, 4);

        builder.Property(p => p.WeightUnit)
            .HasMaxLength(10);

        builder.Property(p => p.Length)
            .HasPrecision(18, 4);

        builder.Property(p => p.Width)
            .HasPrecision(18, 4);

        builder.Property(p => p.Height)
            .HasPrecision(18, 4);

        builder.Property(p => p.DimensionUnit)
            .HasMaxLength(10);

        builder.OwnsOne(p => p.UnitPrice, up =>
        {
            up.Property(m => m.Amount)
                .HasColumnName("UnitPrice")
                .HasPrecision(18, 4)
                .IsRequired();
            up.Property(m => m.Currency)
                .HasColumnName("UnitPriceCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(p => p.CostPrice, cp =>
        {
            cp.Property(m => m.Amount)
                .HasColumnName("CostPrice")
                .HasPrecision(18, 4);
            cp.Property(m => m.Currency)
                .HasColumnName("CostPriceCurrency")
                .HasMaxLength(3);
        });

        builder.Property(p => p.VatRate)
            .HasPrecision(5, 2);

        builder.Property(p => p.MinimumStock)
            .HasPrecision(18, 4);

        builder.Property(p => p.MaximumStock)
            .HasPrecision(18, 4);

        builder.Property(p => p.ReorderPoint)
            .HasPrecision(18, 4);

        // Relationships
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Brand)
            .WithMany(b => b.Products)
            .HasForeignKey(p => p.BrandId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Supplier)
            .WithMany(s => s.Products)
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.UnitEntity)
            .WithMany()
            .HasForeignKey(p => p.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Stocks)
            .WithOne(s => s.Product)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.StockMovements)
            .WithOne(m => m.Product)
            .HasForeignKey(m => m.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Images)
            .WithOne(i => i.Product)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Variants)
            .WithOne(v => v.Product)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => new { p.TenantId, p.Code }).IsUnique();
        builder.HasIndex(p => new { p.TenantId, p.Barcode });
        builder.HasIndex(p => new { p.TenantId, p.CategoryId });
        builder.HasIndex(p => new { p.TenantId, p.BrandId });
        builder.HasIndex(p => new { p.TenantId, p.IsActive });
        builder.HasIndex(p => new { p.TenantId, p.Name });
        builder.HasIndex(p => new { p.TenantId, p.SKU })
            .IsUnique()
            .HasFilter("\"SKU\" IS NOT NULL");
    }
}

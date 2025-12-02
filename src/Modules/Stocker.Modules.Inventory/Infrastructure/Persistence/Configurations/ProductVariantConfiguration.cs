using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("ProductVariants", "inventory");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.TenantId)
            .IsRequired();

        builder.Property(v => v.Sku)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.VariantName)
            .HasMaxLength(200);

        builder.Property(v => v.Barcode)
            .HasMaxLength(100);

        builder.OwnsOne(v => v.Price, m =>
        {
            m.Property(p => p.Amount).HasColumnName("PriceAmount").HasPrecision(18, 2);
            m.Property(p => p.Currency).HasColumnName("PriceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(v => v.CostPrice, m =>
        {
            m.Property(p => p.Amount).HasColumnName("CostPriceAmount").HasPrecision(18, 2);
            m.Property(p => p.Currency).HasColumnName("CostPriceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(v => v.CompareAtPrice, m =>
        {
            m.Property(p => p.Amount).HasColumnName("CompareAtPriceAmount").HasPrecision(18, 2);
            m.Property(p => p.Currency).HasColumnName("CompareAtPriceCurrency").HasMaxLength(3);
        });

        builder.Property(v => v.Weight)
            .HasPrecision(18, 4);

        builder.Property(v => v.WeightUnit)
            .HasMaxLength(20);

        builder.Property(v => v.Dimensions)
            .HasMaxLength(100);

        builder.Property(v => v.ImageUrl)
            .HasMaxLength(500);

        builder.Property(v => v.LowStockThreshold)
            .HasPrecision(18, 4);

        builder.HasOne(v => v.Product)
            .WithMany(p => p.Variants)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(v => v.Options)
            .WithOne(o => o.ProductVariant)
            .HasForeignKey(o => o.ProductVariantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(v => v.TenantId);
        builder.HasIndex(v => new { v.TenantId, v.Sku }).IsUnique();
        builder.HasIndex(v => new { v.ProductId, v.IsActive });
    }
}

public class ProductVariantOptionConfiguration : IEntityTypeConfiguration<ProductVariantOption>
{
    public void Configure(EntityTypeBuilder<ProductVariantOption> builder)
    {
        builder.ToTable("ProductVariantOptions", "inventory");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.TenantId)
            .IsRequired();

        builder.Property(o => o.Value)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasOne(o => o.ProductAttribute)
            .WithMany()
            .HasForeignKey(o => o.ProductAttributeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.ProductAttributeOption)
            .WithMany()
            .HasForeignKey(o => o.ProductAttributeOptionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(o => o.TenantId);
        builder.HasIndex(o => new { o.ProductVariantId, o.ProductAttributeId }).IsUnique();
    }
}

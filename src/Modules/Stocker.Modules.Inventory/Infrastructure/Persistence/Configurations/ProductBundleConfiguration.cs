using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

public class ProductBundleConfiguration : IEntityTypeConfiguration<ProductBundle>
{
    public void Configure(EntityTypeBuilder<ProductBundle> builder)
    {
        builder.ToTable("ProductBundles", "inventory");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.TenantId)
            .IsRequired();

        builder.Property(b => b.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.Description)
            .HasMaxLength(1000);

        builder.Property(b => b.BundleType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(b => b.PricingType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.OwnsOne(b => b.FixedPrice, m =>
        {
            m.Property(p => p.Amount).HasColumnName("FixedPriceAmount").HasPrecision(18, 2);
            m.Property(p => p.Currency).HasColumnName("FixedPriceCurrency").HasMaxLength(3);
        });

        builder.Property(b => b.DiscountPercentage)
            .HasPrecision(5, 2);

        builder.Property(b => b.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(b => b.ImageUrl)
            .HasMaxLength(500);

        builder.HasMany(b => b.Items)
            .WithOne(i => i.ProductBundle)
            .HasForeignKey(i => i.ProductBundleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(b => b.TenantId);
        builder.HasIndex(b => new { b.TenantId, b.Code }).IsUnique();
        builder.HasIndex(b => new { b.TenantId, b.IsActive });
    }
}

public class ProductBundleItemConfiguration : IEntityTypeConfiguration<ProductBundleItem>
{
    public void Configure(EntityTypeBuilder<ProductBundleItem> builder)
    {
        builder.ToTable("ProductBundleItems", "inventory");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.Quantity)
            .HasPrecision(18, 4);

        builder.OwnsOne(i => i.OverridePrice, m =>
        {
            m.Property(p => p.Amount).HasColumnName("OverridePriceAmount").HasPrecision(18, 2);
            m.Property(p => p.Currency).HasColumnName("OverridePriceCurrency").HasMaxLength(3);
        });

        builder.Property(i => i.DiscountPercentage)
            .HasPrecision(5, 2);

        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.ProductBundleId, i.ProductId }).IsUnique();
    }
}

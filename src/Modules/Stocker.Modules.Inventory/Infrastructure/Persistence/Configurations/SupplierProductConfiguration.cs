using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

public class SupplierProductConfiguration : IEntityTypeConfiguration<SupplierProduct>
{
    public void Configure(EntityTypeBuilder<SupplierProduct> builder)
    {
        builder.ToTable("SupplierProducts", "inventory");

        builder.HasKey(sp => sp.Id);

        builder.Property(sp => sp.TenantId)
            .IsRequired();

        builder.Property(sp => sp.SupplierProductCode)
            .HasMaxLength(100);

        builder.Property(sp => sp.SupplierProductName)
            .HasMaxLength(200);

        builder.Property(sp => sp.SupplierBarcode)
            .HasMaxLength(100);

        builder.OwnsOne(sp => sp.UnitCost, m =>
        {
            m.Property(p => p.Amount).HasColumnName("UnitCostAmount").HasPrecision(18, 2);
            m.Property(p => p.Currency).HasColumnName("UnitCostCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(sp => sp.LastPurchasePrice, m =>
        {
            m.Property(p => p.Amount).HasColumnName("LastPurchasePriceAmount").HasPrecision(18, 2);
            m.Property(p => p.Currency).HasColumnName("LastPurchasePriceCurrency").HasMaxLength(3);
        });

        builder.Property(sp => sp.Currency)
            .HasMaxLength(3);

        builder.Property(sp => sp.MinOrderQuantity)
            .HasPrecision(18, 4);

        builder.Property(sp => sp.OrderMultiple)
            .HasPrecision(18, 4);

        builder.Property(sp => sp.Notes)
            .HasMaxLength(1000);

        builder.HasOne(sp => sp.Supplier)
            .WithMany()
            .HasForeignKey(sp => sp.SupplierId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sp => sp.Product)
            .WithMany(p => p.SupplierProducts)
            .HasForeignKey(sp => sp.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(sp => sp.PriceTiers)
            .WithOne(pt => pt.SupplierProduct)
            .HasForeignKey(pt => pt.SupplierProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(sp => sp.TenantId);
        builder.HasIndex(sp => new { sp.SupplierId, sp.ProductId }).IsUnique();
        builder.HasIndex(sp => new { sp.ProductId, sp.IsPreferred });
    }
}

public class SupplierProductPriceTierConfiguration : IEntityTypeConfiguration<SupplierProductPriceTier>
{
    public void Configure(EntityTypeBuilder<SupplierProductPriceTier> builder)
    {
        builder.ToTable("SupplierProductPriceTiers", "inventory");

        builder.HasKey(pt => pt.Id);

        builder.Property(pt => pt.TenantId)
            .IsRequired();

        builder.Property(pt => pt.MinQuantity)
            .HasPrecision(18, 4);

        builder.Property(pt => pt.MaxQuantity)
            .HasPrecision(18, 4);

        builder.OwnsOne(pt => pt.UnitPrice, m =>
        {
            m.Property(p => p.Amount).HasColumnName("UnitPriceAmount").HasPrecision(18, 2);
            m.Property(p => p.Currency).HasColumnName("UnitPriceCurrency").HasMaxLength(3);
        });

        builder.Property(pt => pt.DiscountPercentage)
            .HasPrecision(5, 2);

        builder.HasIndex(pt => pt.TenantId);
        builder.HasIndex(pt => new { pt.SupplierProductId, pt.MinQuantity });
    }
}

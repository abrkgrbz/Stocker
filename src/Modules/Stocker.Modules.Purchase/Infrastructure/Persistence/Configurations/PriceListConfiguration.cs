using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class PriceListConfiguration : IEntityTypeConfiguration<PriceList>
{
    public void Configure(EntityTypeBuilder<PriceList> builder)
    {
        builder.ToTable("PriceLists");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(p => p.Type)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(p => p.SupplierCode)
            .HasMaxLength(50);

        builder.Property(p => p.SupplierName)
            .HasMaxLength(300);

        builder.Property(p => p.Currency)
            .HasMaxLength(10);

        builder.Property(p => p.CreatedByName)
            .HasMaxLength(200);

        builder.Property(p => p.ApprovedByName)
            .HasMaxLength(200);

        builder.Property(p => p.Notes)
            .HasMaxLength(2000);

        builder.Property(p => p.InternalNotes)
            .HasMaxLength(2000);

        builder.HasMany(p => p.Items)
            .WithOne()
            .HasForeignKey(i => i.PriceListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => new { p.TenantId, p.Code, p.Version }).IsUnique();
        builder.HasIndex(p => new { p.TenantId, p.SupplierId });
        builder.HasIndex(p => new { p.TenantId, p.Status });
        builder.HasIndex(p => new { p.TenantId, p.EffectiveFrom, p.EffectiveTo });
        builder.HasIndex(p => new { p.TenantId, p.IsDefault });
    }
}

public class PriceListItemConfiguration : IEntityTypeConfiguration<PriceListItem>
{
    public void Configure(EntityTypeBuilder<PriceListItem> builder)
    {
        builder.ToTable("PriceListItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(i => i.Unit)
            .HasMaxLength(50);

        builder.Property(i => i.BasePrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.DiscountedPrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.Currency)
            .HasMaxLength(10);

        builder.Property(i => i.MinQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.MaxQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        builder.HasMany(i => i.Tiers)
            .WithOne()
            .HasForeignKey(t => t.PriceListItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(i => new { i.TenantId, i.PriceListId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
        builder.HasIndex(i => new { i.TenantId, i.PriceListId, i.ProductId }).IsUnique();
    }
}

public class PriceListItemTierConfiguration : IEntityTypeConfiguration<PriceListItemTier>
{
    public void Configure(EntityTypeBuilder<PriceListItemTier> builder)
    {
        builder.ToTable("PriceListItemTiers");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.MinQuantity)
            .HasPrecision(18, 4);

        builder.Property(t => t.MaxQuantity)
            .HasPrecision(18, 4);

        builder.Property(t => t.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(t => t.DiscountRate)
            .HasPrecision(5, 2);

        builder.HasIndex(t => new { t.TenantId, t.PriceListItemId });
    }
}

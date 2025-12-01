using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for PriceList
/// </summary>
public class PriceListConfiguration : IEntityTypeConfiguration<PriceList>
{
    public void Configure(EntityTypeBuilder<PriceList> builder)
    {
        builder.ToTable("PriceLists", "inventory");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(p => p.GlobalDiscountPercentage)
            .HasPrecision(5, 2);

        builder.Property(p => p.GlobalMarkupPercentage)
            .HasPrecision(5, 2);

        builder.HasMany(p => p.Items)
            .WithOne(i => i.PriceList)
            .HasForeignKey(i => i.PriceListId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => new { p.TenantId, p.Code }).IsUnique();
        builder.HasIndex(p => new { p.TenantId, p.IsActive });
        builder.HasIndex(p => new { p.TenantId, p.IsDefault });
        builder.HasIndex(p => new { p.TenantId, p.CustomerGroupId });
        builder.HasIndex(p => new { p.TenantId, p.ValidFrom, p.ValidTo });
    }
}

/// <summary>
/// Entity configuration for PriceListItem
/// </summary>
public class PriceListItemConfiguration : IEntityTypeConfiguration<PriceListItem>
{
    public void Configure(EntityTypeBuilder<PriceListItem> builder)
    {
        builder.ToTable("PriceListItems", "inventory");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.OwnsOne(i => i.Price, p =>
        {
            p.Property(m => m.Amount)
                .HasColumnName("Price")
                .HasPrecision(18, 4)
                .IsRequired();
            p.Property(m => m.Currency)
                .HasColumnName("PriceCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(i => i.MinQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.MaxQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.DiscountPercentage)
            .HasPrecision(5, 2);

        // Relationships
        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.TenantId, i.PriceListId, i.ProductId }).IsUnique();
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}

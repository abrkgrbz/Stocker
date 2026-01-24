using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

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

        builder.Property(p => p.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.CurrencyCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.OwnsOne(p => p.MinimumOrderAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("MinimumOrderAmount")
                .HasPrecision(18, 4);
            money.Property(m => m.Currency)
                .HasColumnName("MinimumOrderCurrency")
                .HasMaxLength(10);
        });

        builder.Property(p => p.BaseAdjustmentPercentage)
            .HasPrecision(18, 4);

        builder.Property(p => p.CustomerSegment)
            .HasMaxLength(200);

        builder.HasMany(p => p.Items)
            .WithOne()
            .HasForeignKey(i => i.PriceListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.AssignedCustomers)
            .WithOne()
            .HasForeignKey(c => c.PriceListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => new { p.TenantId, p.Code }).IsUnique();
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => p.IsActive);
        builder.HasIndex(p => p.Type);
        builder.HasIndex(p => p.ValidFrom);
        builder.HasIndex(p => p.ValidTo);
        builder.HasIndex(p => p.Priority);
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
            .HasMaxLength(50);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.OwnsOne(i => i.UnitPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("UnitPrice")
                .HasPrecision(18, 4)
                .IsRequired();
            money.Property(m => m.Currency)
                .HasColumnName("UnitPriceCurrency")
                .HasMaxLength(10)
                .IsRequired();
        });

        builder.OwnsOne(i => i.PreviousPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("PreviousPrice")
                .HasPrecision(18, 4);
            money.Property(m => m.Currency)
                .HasColumnName("PreviousPriceCurrency")
                .HasMaxLength(10);
        });

        builder.Property(i => i.UnitOfMeasure)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(i => i.MinimumQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.MaximumQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.DiscountPercentage)
            .HasPrecision(18, 4);

        builder.HasIndex(i => new { i.PriceListId, i.ProductId });
        builder.HasIndex(i => i.ProductId);
        builder.HasIndex(i => i.IsActive);
    }
}

public class PriceListCustomerConfiguration : IEntityTypeConfiguration<PriceListCustomer>
{
    public void Configure(EntityTypeBuilder<PriceListCustomer> builder)
    {
        builder.ToTable("PriceListCustomers");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(c => new { c.PriceListId, c.CustomerId });
        builder.HasIndex(c => c.CustomerId);
        builder.HasIndex(c => c.IsActive);
    }
}

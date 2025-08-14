using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class InvoiceItemConfiguration : BaseEntityTypeConfiguration<InvoiceItem>
{
    public override void Configure(EntityTypeBuilder<InvoiceItem> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("InvoiceItems", "tenant");
        
        // Properties
        builder.Property(ii => ii.TenantId).IsRequired();
        builder.Property(ii => ii.InvoiceId).IsRequired();
        builder.Property(ii => ii.ProductId).IsRequired();
        builder.Property(ii => ii.ProductName).IsRequired().HasMaxLength(200);
        builder.Property(ii => ii.Description).HasMaxLength(500);
        builder.Property(ii => ii.Quantity).IsRequired().HasPrecision(18, 2);
        builder.Property(ii => ii.DiscountPercentage).HasPrecision(5, 2);
        builder.Property(ii => ii.TaxRate).HasPrecision(5, 2);
        
        // Value Objects
        builder.OwnsOne(ii => ii.UnitPrice, money =>
        {
            money.Property(m => m.Amount).HasColumnName("UnitPriceAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("UnitPriceCurrency").HasMaxLength(3);
        });
        
        builder.OwnsOne(ii => ii.TotalPrice, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalPriceAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalPriceCurrency").HasMaxLength(3);
        });
        
        // Nullable value objects
        builder.OwnsOne(ii => ii.DiscountAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DiscountAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("DiscountCurrency").HasMaxLength(3);
        });
        
        builder.OwnsOne(ii => ii.TaxAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TaxAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TaxCurrency").HasMaxLength(3);
        });
        
        // Indexes
        builder.HasIndex(ii => ii.InvoiceId);
        builder.HasIndex(ii => ii.ProductId);
        builder.HasIndex(ii => ii.TenantId);
    }
}
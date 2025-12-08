using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class QuotationConfiguration : IEntityTypeConfiguration<Quotation>
{
    public void Configure(EntityTypeBuilder<Quotation> builder)
    {
        builder.ToTable("Quotations");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.QuotationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(q => q.Name)
            .HasMaxLength(200);

        builder.Property(q => q.CustomerName)
            .HasMaxLength(200);

        builder.Property(q => q.CustomerEmail)
            .HasMaxLength(200);

        builder.Property(q => q.CustomerPhone)
            .HasMaxLength(50);

        builder.Property(q => q.CustomerTaxNumber)
            .HasMaxLength(50);

        builder.Property(q => q.ContactName)
            .HasMaxLength(200);

        builder.Property(q => q.SalesPersonName)
            .HasMaxLength(200);

        builder.Property(q => q.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(q => q.SubTotal)
            .HasPrecision(18, 4);

        builder.Property(q => q.DiscountAmount)
            .HasPrecision(18, 4);

        builder.Property(q => q.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(q => q.VatAmount)
            .HasPrecision(18, 4);

        builder.Property(q => q.ShippingAmount)
            .HasPrecision(18, 4);

        builder.Property(q => q.TotalAmount)
            .HasPrecision(18, 4);

        builder.Property(q => q.ExchangeRate)
            .HasPrecision(18, 6)
            .HasDefaultValue(1m);

        builder.Property(q => q.ShippingAddress)
            .HasMaxLength(500);

        builder.Property(q => q.BillingAddress)
            .HasMaxLength(500);

        builder.Property(q => q.PaymentTerms)
            .HasMaxLength(500);

        builder.Property(q => q.DeliveryTerms)
            .HasMaxLength(500);

        builder.Property(q => q.Notes)
            .HasMaxLength(2000);

        builder.Property(q => q.TermsAndConditions)
            .HasMaxLength(4000);

        builder.Property(q => q.InternalNotes)
            .HasMaxLength(2000);

        builder.Property(q => q.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(q => q.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasMany(q => q.Items)
            .WithOne(i => i.Quotation)
            .HasForeignKey(i => i.QuotationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(q => q.QuotationNumber)
            .IsUnique();

        builder.HasIndex(q => q.TenantId);
        builder.HasIndex(q => q.CustomerId);
        builder.HasIndex(q => q.SalesPersonId);
        builder.HasIndex(q => q.Status);
        builder.HasIndex(q => q.QuotationDate);
    }
}

public class QuotationItemConfiguration : IEntityTypeConfiguration<QuotationItem>
{
    public void Configure(EntityTypeBuilder<QuotationItem> builder)
    {
        builder.ToTable("QuotationItems");

        builder.HasKey(qi => qi.Id);

        builder.Property(qi => qi.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(qi => qi.ProductCode)
            .HasMaxLength(50);

        builder.Property(qi => qi.Description)
            .HasMaxLength(500);

        builder.Property(qi => qi.Unit)
            .HasMaxLength(20)
            .HasDefaultValue("Adet");

        builder.Property(qi => qi.Quantity)
            .HasPrecision(18, 4);

        builder.Property(qi => qi.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(qi => qi.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(qi => qi.DiscountAmount)
            .HasPrecision(18, 4);

        builder.Property(qi => qi.VatRate)
            .HasPrecision(5, 2)
            .HasDefaultValue(20m);

        builder.Property(qi => qi.VatAmount)
            .HasPrecision(18, 4);

        builder.Property(qi => qi.LineTotal)
            .HasPrecision(18, 4);

        builder.HasIndex(qi => qi.TenantId);
        builder.HasIndex(qi => qi.QuotationId);
        builder.HasIndex(qi => qi.ProductId);
    }
}

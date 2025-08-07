using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class InvoiceItemConfiguration : BaseEntityTypeConfiguration<InvoiceItem>
{
    public override void Configure(EntityTypeBuilder<InvoiceItem> builder)
    {
        base.Configure(builder);

        builder.ToTable("InvoiceItems", "master");

        // Properties
        builder.Property(i => i.InvoiceId)
            .IsRequired();

        builder.Property(i => i.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(i => i.Quantity)
            .IsRequired();

        // Value Objects
        builder.OwnsOne(i => i.UnitPrice, price =>
        {
            price.Property(p => p.Amount)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasColumnName("UnitPriceAmount");

            price.Property(p => p.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasColumnName("UnitPriceCurrency");
        });

        builder.OwnsOne(i => i.LineTotal, total =>
        {
            total.Property(t => t.Amount)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasColumnName("LineTotalAmount");

            total.Property(t => t.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasColumnName("LineTotalCurrency");
        });

        // Indexes
        builder.HasIndex(i => i.InvoiceId)
            .HasDatabaseName("IX_InvoiceItems_InvoiceId");
    }
}
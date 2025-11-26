using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices", "sales");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .ValueGeneratedNever();

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.CustomerName)
            .HasMaxLength(200);

        builder.Property(i => i.CustomerEmail)
            .HasMaxLength(255);

        builder.Property(i => i.CustomerTaxNumber)
            .HasMaxLength(50);

        builder.Property(i => i.CustomerAddress)
            .HasMaxLength(500);

        builder.Property(i => i.SubTotal)
            .HasPrecision(18, 2);

        builder.Property(i => i.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.VatAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.TotalAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.PaidAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.RemainingAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(i => i.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(i => i.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(i => i.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(i => i.Notes)
            .HasMaxLength(2000);

        builder.Property(i => i.EInvoiceId)
            .HasMaxLength(100);

        // Relationships
        builder.HasMany(i => i.Items)
            .WithOne(item => item.Invoice)
            .HasForeignKey(item => item.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.SalesOrder)
            .WithMany()
            .HasForeignKey(i => i.SalesOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.TenantId, i.InvoiceNumber }).IsUnique();
        builder.HasIndex(i => new { i.TenantId, i.CustomerId });
        builder.HasIndex(i => new { i.TenantId, i.Status });
        builder.HasIndex(i => new { i.TenantId, i.InvoiceDate });
        builder.HasIndex(i => new { i.TenantId, i.DueDate });
        builder.HasIndex(i => new { i.TenantId, i.SalesOrderId });
        builder.HasIndex(i => new { i.TenantId, i.EInvoiceId });
    }
}

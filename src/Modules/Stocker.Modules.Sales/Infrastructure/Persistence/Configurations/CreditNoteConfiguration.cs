using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class CreditNoteConfiguration : IEntityTypeConfiguration<CreditNote>
{
    public void Configure(EntityTypeBuilder<CreditNote> builder)
    {
        builder.ToTable("CreditNotes", "sales");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.CreditNoteNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.Reason)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(c => c.ReasonDescription)
            .HasMaxLength(500);

        // Source Documents
        builder.Property(c => c.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.SalesReturnNumber)
            .HasMaxLength(50);

        builder.Property(c => c.SalesOrderNumber)
            .HasMaxLength(50);

        // Customer
        builder.Property(c => c.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.CustomerTaxNumber)
            .HasMaxLength(20);

        builder.Property(c => c.CustomerAddress)
            .HasMaxLength(500);

        // Amounts
        builder.Property(c => c.SubTotal)
            .HasPrecision(18, 2);

        builder.Property(c => c.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(c => c.TaxAmount)
            .HasPrecision(18, 2);

        builder.Property(c => c.TotalAmount)
            .HasPrecision(18, 2);

        builder.Property(c => c.AppliedAmount)
            .HasPrecision(18, 2);

        builder.Property(c => c.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(c => c.ExchangeRate)
            .HasPrecision(18, 6)
            .HasDefaultValue(1m);

        // Status
        builder.Property(c => c.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.VoidReason)
            .HasMaxLength(500);

        // e-Document
        builder.Property(c => c.EDocumentId)
            .HasMaxLength(100);

        // Metadata
        builder.Property(c => c.Notes)
            .HasMaxLength(2000);

        // Navigation
        builder.HasMany(c => c.Items)
            .WithOne()
            .HasForeignKey(i => i.CreditNoteId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => c.CreditNoteNumber);
        builder.HasIndex(c => new { c.TenantId, c.CreditNoteNumber }).IsUnique();
        builder.HasIndex(c => c.InvoiceId);
        builder.HasIndex(c => c.SalesReturnId);
        builder.HasIndex(c => c.SalesOrderId);
        builder.HasIndex(c => c.CustomerId);
        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => c.CreditNoteDate);
        builder.HasIndex(c => new { c.TenantId, c.Status, c.IsApproved });
    }
}

public class CreditNoteItemConfiguration : IEntityTypeConfiguration<CreditNoteItem>
{
    public void Configure(EntityTypeBuilder<CreditNoteItem> builder)
    {
        builder.ToTable("CreditNoteItems", "sales");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.Description)
            .HasMaxLength(500);

        builder.Property(i => i.Unit)
            .HasMaxLength(20)
            .HasDefaultValue("Adet");

        // Amounts
        builder.Property(i => i.Quantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.TaxRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.TaxAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.LineTotal)
            .HasPrecision(18, 2);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => i.CreditNoteId);
        builder.HasIndex(i => i.ProductId);
        builder.HasIndex(i => i.InvoiceItemId);
    }
}

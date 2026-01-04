using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Invoice
/// </summary>
public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices", "finance");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(16);

        builder.Property(i => i.Series)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(i => i.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(i => i.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(i => i.CurrentAccountName)
            .HasMaxLength(200);

        builder.Property(i => i.TaxNumber)
            .HasMaxLength(11);

        builder.Property(i => i.IdentityNumber)
            .HasMaxLength(11);

        builder.Property(i => i.TaxOffice)
            .HasMaxLength(100);

        // Address fields
        builder.Property(i => i.BillingAddress).HasMaxLength(500);
        builder.Property(i => i.BillingDistrict).HasMaxLength(100);
        builder.Property(i => i.BillingCity).HasMaxLength(100);
        builder.Property(i => i.BillingCountry).HasMaxLength(100);
        builder.Property(i => i.BillingPostalCode).HasMaxLength(20);
        builder.Property(i => i.DeliveryAddress).HasMaxLength(500);
        builder.Property(i => i.DeliveryDistrict).HasMaxLength(100);
        builder.Property(i => i.DeliveryCity).HasMaxLength(100);
        builder.Property(i => i.DeliveryCountry).HasMaxLength(100);

        // Money value objects
        builder.OwnsOne(i => i.LineExtensionAmount, ConfigureMoney("LineExtensionAmount"));
        builder.OwnsOne(i => i.GrossAmount, ConfigureMoney("GrossAmount"));
        builder.OwnsOne(i => i.TotalDiscount, ConfigureMoney("TotalDiscount"));
        builder.OwnsOne(i => i.NetAmountBeforeTax, ConfigureMoney("NetAmountBeforeTax"));
        builder.OwnsOne(i => i.TotalVat, ConfigureMoney("TotalVat"));
        builder.OwnsOne(i => i.VatWithholdingAmount, ConfigureMoney("VatWithholdingAmount"));
        builder.OwnsOne(i => i.TotalOtherTaxes, ConfigureMoney("TotalOtherTaxes"));
        builder.OwnsOne(i => i.WithholdingTaxAmount, ConfigureMoney("WithholdingTaxAmount"));
        builder.OwnsOne(i => i.GrandTotal, ConfigureMoney("GrandTotal"));
        builder.OwnsOne(i => i.GrandTotalTRY, ConfigureMoney("GrandTotalTRY"));
        builder.OwnsOne(i => i.PaidAmount, ConfigureMoney("PaidAmount"));
        builder.OwnsOne(i => i.RemainingAmount, ConfigureMoney("RemainingAmount"));

        // Payment and Due Date
        builder.Property(i => i.PaymentTerms).HasMaxLength(200);
        builder.Property(i => i.PaymentNote).HasMaxLength(500);

        // E-Invoice fields
        builder.Property(i => i.GibEnvelopeId).HasMaxLength(100);
        builder.Property(i => i.GibStatusCode).HasMaxLength(10);
        builder.Property(i => i.GibStatusDescription).HasMaxLength(500);
        builder.Property(i => i.ReceiverAlias).HasMaxLength(100);
        builder.Property(i => i.SignatureCertificateSerial).HasMaxLength(100);

        // Withholding
        builder.Property(i => i.WithholdingReason).HasMaxLength(500);
        builder.Property(i => i.VatExemptionDescription).HasMaxLength(500);

        // Reference fields
        builder.Property(i => i.WaybillNumber).HasMaxLength(50);
        builder.Property(i => i.OrderNumber).HasMaxLength(50);
        builder.Property(i => i.RelatedInvoiceNumber).HasMaxLength(16);

        // Other fields
        builder.Property(i => i.Notes).HasMaxLength(2000);
        builder.Property(i => i.InternalNotes).HasMaxLength(2000);
        builder.Property(i => i.PdfFilePath).HasMaxLength(500);
        builder.Property(i => i.XmlFilePath).HasMaxLength(500);

        // Relationships
        builder.HasOne(i => i.CurrentAccount)
            .WithMany(ca => ca.Invoices)
            .HasForeignKey(i => i.CurrentAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.RelatedInvoice)
            .WithMany()
            .HasForeignKey(i => i.RelatedInvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(i => i.JournalEntry)
            .WithMany()
            .HasForeignKey(i => i.JournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(i => i.Lines)
            .WithOne(l => l.Invoice)
            .HasForeignKey(l => l.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(i => i.Taxes)
            .WithOne(t => t.Invoice)
            .HasForeignKey(t => t.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.TenantId, i.InvoiceNumber }).IsUnique();
        builder.HasIndex(i => new { i.TenantId, i.Series, i.SequenceNumber });
        builder.HasIndex(i => new { i.TenantId, i.InvoiceDate });
        builder.HasIndex(i => new { i.TenantId, i.Status });
        builder.HasIndex(i => new { i.TenantId, i.InvoiceType });
        builder.HasIndex(i => new { i.TenantId, i.CurrentAccountId });
        builder.HasIndex(i => i.GibUuid);
        builder.HasIndex(i => i.DueDate);
    }

    private static Action<OwnedNavigationBuilder<Invoice, Money>> ConfigureMoney(string columnPrefix)
    {
        return money =>
        {
            money.Property(m => m.Amount).HasColumnName(columnPrefix).HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName($"{columnPrefix}Currency").HasMaxLength(3);
        };
    }
}

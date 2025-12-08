using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class SupplierPaymentConfiguration : IEntityTypeConfiguration<SupplierPayment>
{
    public void Configure(EntityTypeBuilder<SupplierPayment> builder)
    {
        builder.ToTable("SupplierPayments");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.PaymentNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.SupplierName)
            .HasMaxLength(300);

        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.Method)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.Amount)
            .HasPrecision(18, 4);

        builder.Property(p => p.Currency)
            .HasMaxLength(10);

        builder.Property(p => p.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(p => p.AmountInBaseCurrency)
            .HasPrecision(18, 4);

        builder.Property(p => p.BankName)
            .HasMaxLength(200);

        builder.Property(p => p.BankAccountNumber)
            .HasMaxLength(50);

        builder.Property(p => p.IBAN)
            .HasMaxLength(34);

        builder.Property(p => p.SwiftCode)
            .HasMaxLength(11);

        builder.Property(p => p.CheckNumber)
            .HasMaxLength(50);

        builder.Property(p => p.TransactionReference)
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.PurchaseInvoiceNumber)
            .HasMaxLength(50);

        builder.Property(p => p.LinkedInvoiceIds)
            .HasMaxLength(4000);

        builder.Property(p => p.ApprovedByName)
            .HasMaxLength(200);

        builder.Property(p => p.ProcessedByName)
            .HasMaxLength(200);

        builder.Property(p => p.Notes)
            .HasMaxLength(2000);

        builder.Property(p => p.InternalNotes)
            .HasMaxLength(2000);

        builder.Property(p => p.ReconciliationReference)
            .HasMaxLength(100);

        builder.HasIndex(p => new { p.TenantId, p.PaymentNumber }).IsUnique();
        builder.HasIndex(p => new { p.TenantId, p.SupplierId });
        builder.HasIndex(p => new { p.TenantId, p.Status });
        builder.HasIndex(p => new { p.TenantId, p.PaymentDate });
        builder.HasIndex(p => new { p.TenantId, p.PurchaseInvoiceId });
        builder.HasIndex(p => new { p.TenantId, p.IsReconciled });
    }
}

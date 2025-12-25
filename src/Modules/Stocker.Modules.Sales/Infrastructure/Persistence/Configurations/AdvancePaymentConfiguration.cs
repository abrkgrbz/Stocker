using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class AdvancePaymentConfiguration : IEntityTypeConfiguration<AdvancePayment>
{
    public void Configure(EntityTypeBuilder<AdvancePayment> builder)
    {
        builder.ToTable("AdvancePayments", "sales");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.PaymentNumber)
            .IsRequired()
            .HasMaxLength(50);

        // Customer
        builder.Property(a => a.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.CustomerTaxNumber)
            .HasMaxLength(20);

        // Order
        builder.Property(a => a.SalesOrderNumber)
            .HasMaxLength(50);

        builder.Property(a => a.OrderTotalAmount)
            .HasPrecision(18, 2);

        // Amount
        builder.Property(a => a.Amount)
            .HasPrecision(18, 2);

        builder.Property(a => a.AppliedAmount)
            .HasPrecision(18, 2);

        builder.Property(a => a.RefundedAmount)
            .HasPrecision(18, 2);

        builder.Property(a => a.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(a => a.ExchangeRate)
            .HasPrecision(18, 6)
            .HasDefaultValue(1m);

        // Payment Method
        builder.Property(a => a.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(a => a.PaymentReference)
            .HasMaxLength(100);

        builder.Property(a => a.BankName)
            .HasMaxLength(100);

        builder.Property(a => a.BankAccountNumber)
            .HasMaxLength(50);

        builder.Property(a => a.CheckNumber)
            .HasMaxLength(50);

        // Status
        builder.Property(a => a.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Capture
        builder.Property(a => a.CapturedByName)
            .HasMaxLength(200);

        // Refund
        builder.Property(a => a.RefundReason)
            .HasMaxLength(500);

        // Receipt
        builder.Property(a => a.ReceiptNumber)
            .HasMaxLength(50);

        // Audit
        builder.Property(a => a.Notes)
            .HasMaxLength(2000);

        builder.Property(a => a.CreatedByName)
            .HasMaxLength(200);

        // Indexes
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => a.PaymentNumber);
        builder.HasIndex(a => new { a.TenantId, a.PaymentNumber }).IsUnique();
        builder.HasIndex(a => a.CustomerId);
        builder.HasIndex(a => a.SalesOrderId);
        builder.HasIndex(a => a.Status);
        builder.HasIndex(a => a.PaymentDate);
        builder.HasIndex(a => new { a.TenantId, a.Status });
        builder.HasIndex(a => new { a.TenantId, a.CustomerId, a.Status });
    }
}

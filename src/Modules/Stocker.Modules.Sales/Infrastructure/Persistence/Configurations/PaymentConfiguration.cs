using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments", "sales");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .ValueGeneratedNever();

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.PaymentNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.CustomerName)
            .HasMaxLength(200);

        builder.Property(p => p.Amount)
            .HasPrecision(18, 2);

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(p => p.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(p => p.Method)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.ReferenceNumber)
            .HasMaxLength(100);

        builder.Property(p => p.BankName)
            .HasMaxLength(100);

        builder.Property(p => p.BankAccountNumber)
            .HasMaxLength(50);

        builder.Property(p => p.CheckNumber)
            .HasMaxLength(50);

        builder.Property(p => p.CardLastFourDigits)
            .HasMaxLength(4);

        builder.Property(p => p.CardType)
            .HasMaxLength(20);

        builder.Property(p => p.TransactionId)
            .HasMaxLength(100);

        builder.Property(p => p.Notes)
            .HasMaxLength(2000);

        builder.Property(p => p.ReceivedByName)
            .HasMaxLength(200);

        // Relationships
        builder.HasOne(p => p.Invoice)
            .WithMany()
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => new { p.TenantId, p.PaymentNumber }).IsUnique();
        builder.HasIndex(p => new { p.TenantId, p.CustomerId });
        builder.HasIndex(p => new { p.TenantId, p.InvoiceId });
        builder.HasIndex(p => new { p.TenantId, p.Status });
        builder.HasIndex(p => new { p.TenantId, p.PaymentDate });
        builder.HasIndex(p => new { p.TenantId, p.Method });
    }
}

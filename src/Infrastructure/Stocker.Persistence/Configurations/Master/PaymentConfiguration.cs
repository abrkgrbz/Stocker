using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class PaymentConfiguration : BaseEntityTypeConfiguration<Payment>
{
    public override void Configure(EntityTypeBuilder<Payment> builder)
    {
        base.Configure(builder);

        builder.ToTable("Payments", "master");

        // Properties
        builder.Property(p => p.InvoiceId)
            .IsRequired();

        builder.Property(p => p.Method)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.TransactionId)
            .HasMaxLength(100);

        builder.Property(p => p.Notes)
            .HasMaxLength(500);

        builder.Property(p => p.ProcessedAt)
            .IsRequired();

        builder.Property(p => p.IsRefund)
            .IsRequired();

        builder.Property(p => p.RefundReason)
            .HasMaxLength(500);

        // Value Objects
        builder.OwnsOne(p => p.Amount, amount =>
        {
            amount.Property(a => a.Amount)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasColumnName("Amount");

            amount.Property(a => a.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasColumnName("Currency");
        });

        // Indexes
        builder.HasIndex(p => p.InvoiceId)
            .HasDatabaseName("IX_Payments_InvoiceId");

        builder.HasIndex(p => p.Status)
            .HasDatabaseName("IX_Payments_Status");

        builder.HasIndex(p => p.ProcessedAt)
            .HasDatabaseName("IX_Payments_ProcessedAt");
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Transaction
/// </summary>
public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("Transactions", "finance");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TenantId)
            .IsRequired();

        builder.Property(t => t.TransactionNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(t => t.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(t => t.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(t => t.TransactionType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.ReferenceType)
            .HasMaxLength(50);

        builder.Property(t => t.ReferenceNumber)
            .HasMaxLength(50);

        // Money value objects - owned entities
        builder.OwnsOne(t => t.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(t => t.LocalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("LocalAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("LocalAmountCurrency").HasMaxLength(3);
        });

        // Self-referencing relationship (Reversed Transaction)
        builder.HasOne(t => t.ReversedTransaction)
            .WithMany()
            .HasForeignKey(t => t.ReversedTransactionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationships
        builder.HasOne(t => t.DebitAccount)
            .WithMany()
            .HasForeignKey(t => t.DebitAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.CreditAccount)
            .WithMany()
            .HasForeignKey(t => t.CreditAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(t => t.TenantId);
        builder.HasIndex(t => new { t.TenantId, t.TransactionNumber }).IsUnique();
        builder.HasIndex(t => new { t.TenantId, t.TransactionDate });
        builder.HasIndex(t => new { t.TenantId, t.TransactionType });
        builder.HasIndex(t => new { t.TenantId, t.IsReversed });
        builder.HasIndex(t => t.DebitAccountId);
        builder.HasIndex(t => t.CreditAccountId);
        builder.HasIndex(t => t.CostCenterId);
        builder.HasIndex(t => t.ProjectId);
        builder.HasIndex(t => t.ReferenceId);
    }
}

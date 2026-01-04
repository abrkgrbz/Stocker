using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for BankTransaction
/// </summary>
public class BankTransactionConfiguration : IEntityTypeConfiguration<BankTransaction>
{
    public void Configure(EntityTypeBuilder<BankTransaction> builder)
    {
        builder.ToTable("BankTransactions", "finance");

        builder.HasKey(bt => bt.Id);

        builder.Property(bt => bt.TenantId)
            .IsRequired();

        builder.Property(bt => bt.TransactionNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(bt => bt.BankReceiptNumber)
            .HasMaxLength(50);

        builder.Property(bt => bt.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(bt => bt.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(bt => bt.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(bt => bt.CounterpartyName)
            .HasMaxLength(200);

        builder.Property(bt => bt.CounterpartyIban)
            .HasMaxLength(34);

        builder.Property(bt => bt.CounterpartyBank)
            .HasMaxLength(200);

        builder.Property(bt => bt.CounterpartyTaxId)
            .HasMaxLength(11);

        builder.Property(bt => bt.ReferenceType)
            .HasMaxLength(50);

        builder.Property(bt => bt.ReferenceNumber)
            .HasMaxLength(50);

        builder.Property(bt => bt.MatchingNote)
            .HasMaxLength(500);

        builder.Property(bt => bt.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(bt => bt.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(bt => bt.AmountTRY, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AmountTRY").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountTRYCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(bt => bt.Commission, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Commission").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CommissionCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(bt => bt.Bsmv, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Bsmv").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BsmvCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(bt => bt.NetAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("NetAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("NetAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(bt => bt.BalanceAfter, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BalanceAfter").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BalanceAfterCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(bt => bt.BankAccount)
            .WithMany(ba => ba.Transactions)
            .HasForeignKey(bt => bt.BankAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(bt => bt.CurrentAccount)
            .WithMany()
            .HasForeignKey(bt => bt.CurrentAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(bt => bt.Invoice)
            .WithMany()
            .HasForeignKey(bt => bt.InvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(bt => bt.Payment)
            .WithMany()
            .HasForeignKey(bt => bt.PaymentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(bt => bt.Check)
            .WithMany()
            .HasForeignKey(bt => bt.CheckId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(bt => bt.CashAccount)
            .WithMany()
            .HasForeignKey(bt => bt.CashAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(bt => bt.CounterBankAccount)
            .WithMany()
            .HasForeignKey(bt => bt.CounterBankAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(bt => bt.JournalEntry)
            .WithMany()
            .HasForeignKey(bt => bt.JournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(bt => bt.CostCenter)
            .WithMany()
            .HasForeignKey(bt => bt.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(bt => bt.TenantId);
        builder.HasIndex(bt => new { bt.TenantId, bt.TransactionNumber }).IsUnique();
        builder.HasIndex(bt => new { bt.TenantId, bt.BankAccountId });
        builder.HasIndex(bt => new { bt.TenantId, bt.TransactionDate });
        builder.HasIndex(bt => new { bt.TenantId, bt.ValueDate });
        builder.HasIndex(bt => new { bt.TenantId, bt.TransactionType });
        builder.HasIndex(bt => new { bt.TenantId, bt.Direction });
        builder.HasIndex(bt => new { bt.TenantId, bt.Status });
        builder.HasIndex(bt => new { bt.TenantId, bt.IsMatched });
        builder.HasIndex(bt => new { bt.TenantId, bt.IsReconciled });
        builder.HasIndex(bt => bt.CurrentAccountId);
    }
}

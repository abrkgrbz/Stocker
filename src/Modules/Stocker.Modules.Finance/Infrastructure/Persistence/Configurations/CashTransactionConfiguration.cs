using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for CashTransaction
/// </summary>
public class CashTransactionConfiguration : IEntityTypeConfiguration<CashTransaction>
{
    public void Configure(EntityTypeBuilder<CashTransaction> builder)
    {
        builder.ToTable("CashTransactions", "finance");

        builder.HasKey(ct => ct.Id);

        builder.Property(ct => ct.TenantId)
            .IsRequired();

        builder.Property(ct => ct.TransactionNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ct => ct.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(ct => ct.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(ct => ct.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(ct => ct.ReferenceType)
            .HasMaxLength(50);

        builder.Property(ct => ct.ReferenceNumber)
            .HasMaxLength(50);

        builder.Property(ct => ct.OperatorName)
            .HasMaxLength(200);

        builder.Property(ct => ct.OperatorTaxId)
            .HasMaxLength(11);

        builder.Property(ct => ct.OperatorPhone)
            .HasMaxLength(50);

        builder.Property(ct => ct.ReceiptNumber)
            .HasMaxLength(50);

        builder.Property(ct => ct.CancelReason)
            .HasMaxLength(500);

        builder.Property(ct => ct.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(ct => ct.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ct => ct.AmountTRY, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AmountTRY").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountTRYCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ct => ct.BalanceAfter, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BalanceAfter").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BalanceAfterCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(ct => ct.CashAccount)
            .WithMany(ca => ca.Transactions)
            .HasForeignKey(ct => ct.CashAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ct => ct.CurrentAccount)
            .WithMany()
            .HasForeignKey(ct => ct.CurrentAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ct => ct.Invoice)
            .WithMany()
            .HasForeignKey(ct => ct.InvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ct => ct.Payment)
            .WithMany()
            .HasForeignKey(ct => ct.PaymentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ct => ct.Expense)
            .WithMany()
            .HasForeignKey(ct => ct.ExpenseId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ct => ct.BankAccount)
            .WithMany()
            .HasForeignKey(ct => ct.BankAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ct => ct.CounterCashAccount)
            .WithMany()
            .HasForeignKey(ct => ct.CounterCashAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ct => ct.JournalEntry)
            .WithMany()
            .HasForeignKey(ct => ct.JournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ct => ct.CostCenter)
            .WithMany()
            .HasForeignKey(ct => ct.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(ct => ct.TenantId);
        builder.HasIndex(ct => new { ct.TenantId, ct.TransactionNumber }).IsUnique();
        builder.HasIndex(ct => new { ct.TenantId, ct.CashAccountId });
        builder.HasIndex(ct => new { ct.TenantId, ct.TransactionDate });
        builder.HasIndex(ct => new { ct.TenantId, ct.TransactionType });
        builder.HasIndex(ct => new { ct.TenantId, ct.Direction });
        builder.HasIndex(ct => new { ct.TenantId, ct.Status });
        builder.HasIndex(ct => new { ct.TenantId, ct.IsCancelled });
        builder.HasIndex(ct => ct.CurrentAccountId);
    }
}

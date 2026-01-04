using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for CurrentAccountTransaction
/// </summary>
public class CurrentAccountTransactionConfiguration : IEntityTypeConfiguration<CurrentAccountTransaction>
{
    public void Configure(EntityTypeBuilder<CurrentAccountTransaction> builder)
    {
        builder.ToTable("CurrentAccountTransactions", "finance");

        builder.HasKey(cat => cat.Id);

        builder.Property(cat => cat.TenantId)
            .IsRequired();

        builder.Property(cat => cat.TransactionNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(cat => cat.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(cat => cat.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(cat => cat.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(cat => cat.ReferenceType)
            .HasMaxLength(50);

        builder.Property(cat => cat.ReferenceNumber)
            .HasMaxLength(50);

        builder.Property(cat => cat.CancelReason)
            .HasMaxLength(500);

        builder.Property(cat => cat.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(cat => cat.DebitAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DebitAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DebitAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(cat => cat.CreditAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CreditAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CreditAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(cat => cat.DebitAmountTRY, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DebitAmountTRY").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DebitAmountTRYCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(cat => cat.CreditAmountTRY, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CreditAmountTRY").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CreditAmountTRYCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(cat => cat.RunningBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RunningBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RunningBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(cat => cat.RemainingAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RemainingAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RemainingAmountCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(cat => cat.CurrentAccount)
            .WithMany()
            .HasForeignKey(cat => cat.CurrentAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cat => cat.Invoice)
            .WithMany()
            .HasForeignKey(cat => cat.InvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(cat => cat.Payment)
            .WithMany()
            .HasForeignKey(cat => cat.PaymentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(cat => cat.Check)
            .WithMany()
            .HasForeignKey(cat => cat.CheckId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(cat => cat.PromissoryNote)
            .WithMany()
            .HasForeignKey(cat => cat.PromissoryNoteId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(cat => cat.JournalEntry)
            .WithMany()
            .HasForeignKey(cat => cat.JournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(cat => cat.CostCenter)
            .WithMany()
            .HasForeignKey(cat => cat.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(cat => cat.TenantId);
        builder.HasIndex(cat => new { cat.TenantId, cat.TransactionNumber }).IsUnique();
        builder.HasIndex(cat => new { cat.TenantId, cat.CurrentAccountId });
        builder.HasIndex(cat => new { cat.TenantId, cat.TransactionDate });
        builder.HasIndex(cat => new { cat.TenantId, cat.TransactionType });
        builder.HasIndex(cat => new { cat.TenantId, cat.DueDate });
        builder.HasIndex(cat => new { cat.TenantId, cat.IsClosed });
        builder.HasIndex(cat => new { cat.TenantId, cat.IsCancelled });
        builder.HasIndex(cat => cat.CurrentAccountId);
        builder.HasIndex(cat => cat.InvoiceId);
        builder.HasIndex(cat => cat.PaymentId);
        builder.HasIndex(cat => cat.CheckId);
        builder.HasIndex(cat => cat.PromissoryNoteId);
        builder.HasIndex(cat => cat.JournalEntryId);
        builder.HasIndex(cat => cat.ReferenceId);
    }
}

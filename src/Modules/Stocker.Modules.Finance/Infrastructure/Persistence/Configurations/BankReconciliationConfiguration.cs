using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for BankReconciliation
/// </summary>
public class BankReconciliationConfiguration : IEntityTypeConfiguration<BankReconciliation>
{
    public void Configure(EntityTypeBuilder<BankReconciliation> builder)
    {
        builder.ToTable("BankReconciliations", "finance");

        builder.HasKey(br => br.Id);

        builder.Property(br => br.TenantId)
            .IsRequired();

        builder.Property(br => br.ReconciliationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(br => br.Description)
            .HasMaxLength(500);

        builder.Property(br => br.StatementNumber)
            .HasMaxLength(50);

        builder.Property(br => br.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(br => br.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(br => br.BankOpeningBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BankOpeningBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BankOpeningBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.BankClosingBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BankClosingBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BankClosingBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.BankTotalCredits, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BankTotalCredits").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BankTotalCreditsCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.BankTotalDebits, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BankTotalDebits").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BankTotalDebitsCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.SystemOpeningBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SystemOpeningBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SystemOpeningBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.SystemClosingBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SystemClosingBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SystemClosingBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.SystemTotalCredits, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SystemTotalCredits").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SystemTotalCreditsCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.SystemTotalDebits, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SystemTotalDebits").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SystemTotalDebitsCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.BalanceDifference, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BalanceDifference").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BalanceDifferenceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.MatchedTotalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MatchedTotalAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("MatchedTotalAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.UnmatchedBankAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("UnmatchedBankAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("UnmatchedBankAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.UnmatchedSystemAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("UnmatchedSystemAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("UnmatchedSystemAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(br => br.TotalAdjustmentAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalAdjustmentAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalAdjustmentAmountCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(br => br.BankAccount)
            .WithMany()
            .HasForeignKey(br => br.BankAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(br => br.AdjustmentJournalEntry)
            .WithMany()
            .HasForeignKey(br => br.AdjustmentJournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(br => br.Items)
            .WithOne(i => i.Reconciliation)
            .HasForeignKey(i => i.ReconciliationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(br => br.TenantId);
        builder.HasIndex(br => new { br.TenantId, br.ReconciliationNumber }).IsUnique();
        builder.HasIndex(br => new { br.TenantId, br.BankAccountId });
        builder.HasIndex(br => new { br.TenantId, br.Status });
        builder.HasIndex(br => new { br.TenantId, br.PeriodStart, br.PeriodEnd });
        builder.HasIndex(br => new { br.TenantId, br.ReconciliationDate });
    }
}

/// <summary>
/// Entity configuration for BankReconciliationItem
/// </summary>
public class BankReconciliationItemConfiguration : IEntityTypeConfiguration<BankReconciliationItem>
{
    public void Configure(EntityTypeBuilder<BankReconciliationItem> builder)
    {
        builder.ToTable("BankReconciliationItems", "finance");

        builder.HasKey(bi => bi.Id);

        builder.Property(bi => bi.TenantId)
            .IsRequired();

        builder.Property(bi => bi.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(bi => bi.ReferenceNumber)
            .HasMaxLength(50);

        builder.Property(bi => bi.Counterparty)
            .HasMaxLength(200);

        builder.Property(bi => bi.CorrectionNote)
            .HasMaxLength(500);

        builder.Property(bi => bi.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(bi => bi.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(bi => bi.DifferenceAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DifferenceAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DifferenceAmountCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(bi => bi.Reconciliation)
            .WithMany(br => br.Items)
            .HasForeignKey(bi => bi.ReconciliationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(bi => bi.BankTransaction)
            .WithMany()
            .HasForeignKey(bi => bi.BankTransactionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(bi => bi.TenantId);
        builder.HasIndex(bi => bi.ReconciliationId);
        builder.HasIndex(bi => new { bi.TenantId, bi.ItemType });
        builder.HasIndex(bi => new { bi.TenantId, bi.IsMatched });
        builder.HasIndex(bi => bi.MatchedItemId);
    }
}

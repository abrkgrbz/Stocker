using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for BankAccount
/// </summary>
public class BankAccountConfiguration : IEntityTypeConfiguration<BankAccount>
{
    public void Configure(EntityTypeBuilder<BankAccount> builder)
    {
        builder.ToTable("BankAccounts", "finance");

        builder.HasKey(ba => ba.Id);

        builder.Property(ba => ba.TenantId)
            .IsRequired();

        builder.Property(ba => ba.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ba => ba.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ba => ba.BankName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ba => ba.BranchName)
            .HasMaxLength(200);

        builder.Property(ba => ba.BranchCode)
            .HasMaxLength(20);

        builder.Property(ba => ba.AccountNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ba => ba.Iban)
            .IsRequired()
            .HasMaxLength(34);

        builder.Property(ba => ba.SwiftCode)
            .HasMaxLength(11);

        builder.Property(ba => ba.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(ba => ba.IntegrationType)
            .HasMaxLength(50);

        builder.Property(ba => ba.PosTerminalId)
            .HasMaxLength(50);

        builder.Property(ba => ba.PosMerchantId)
            .HasMaxLength(50);

        builder.Property(ba => ba.PosCommissionRate)
            .HasPrecision(5, 2);

        builder.Property(ba => ba.InterestRate)
            .HasPrecision(5, 2);

        builder.Property(ba => ba.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(ba => ba.Balance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Balance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ba => ba.BlockedBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BlockedBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BlockedBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ba => ba.AvailableBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AvailableBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AvailableBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ba => ba.ReconciledBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ReconciledBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("ReconciledBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ba => ba.DailyTransferLimit, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DailyTransferLimit").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DailyTransferLimitCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ba => ba.SingleTransferLimit, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SingleTransferLimit").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SingleTransferLimitCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ba => ba.CreditLimit, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CreditLimit").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CreditLimitCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(ba => ba.AccountingAccount)
            .WithMany()
            .HasForeignKey(ba => ba.AccountingAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(ba => ba.Transactions)
            .WithOne(t => t.BankAccount)
            .HasForeignKey(t => t.BankAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ba => ba.TenantId);
        builder.HasIndex(ba => new { ba.TenantId, ba.Code }).IsUnique();
        builder.HasIndex(ba => new { ba.TenantId, ba.Name });
        builder.HasIndex(ba => new { ba.TenantId, ba.Iban }).IsUnique();
        builder.HasIndex(ba => new { ba.TenantId, ba.AccountType });
        builder.HasIndex(ba => new { ba.TenantId, ba.Currency });
        builder.HasIndex(ba => new { ba.TenantId, ba.IsActive });
        builder.HasIndex(ba => new { ba.TenantId, ba.IsDefault });
    }
}

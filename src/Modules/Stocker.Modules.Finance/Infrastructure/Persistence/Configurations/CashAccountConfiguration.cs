using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for CashAccount
/// </summary>
public class CashAccountConfiguration : IEntityTypeConfiguration<CashAccount>
{
    public void Configure(EntityTypeBuilder<CashAccount> builder)
    {
        builder.ToTable("CashAccounts", "finance");

        builder.HasKey(ca => ca.Id);

        builder.Property(ca => ca.TenantId)
            .IsRequired();

        builder.Property(ca => ca.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ca => ca.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ca => ca.Description)
            .HasMaxLength(500);

        builder.Property(ca => ca.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(ca => ca.BranchName)
            .HasMaxLength(200);

        builder.Property(ca => ca.WarehouseName)
            .HasMaxLength(200);

        builder.Property(ca => ca.ResponsibleUserName)
            .HasMaxLength(200);

        builder.Property(ca => ca.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(ca => ca.Balance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Balance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.MinimumBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MinimumBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("MinimumBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.MaximumBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MaximumBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("MaximumBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.OpeningBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("OpeningBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("OpeningBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.LastCountBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("LastCountBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("LastCountBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.DailyTransactionLimit, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DailyTransactionLimit").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DailyTransactionLimitCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.SingleTransactionLimit, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SingleTransactionLimit").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SingleTransactionLimitCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(ca => ca.AccountingAccount)
            .WithMany()
            .HasForeignKey(ca => ca.AccountingAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(ca => ca.Transactions)
            .WithOne(t => t.CashAccount)
            .HasForeignKey(t => t.CashAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ca => ca.TenantId);
        builder.HasIndex(ca => new { ca.TenantId, ca.Code }).IsUnique();
        builder.HasIndex(ca => new { ca.TenantId, ca.Name });
        builder.HasIndex(ca => new { ca.TenantId, ca.AccountType });
        builder.HasIndex(ca => new { ca.TenantId, ca.Currency });
        builder.HasIndex(ca => new { ca.TenantId, ca.IsActive });
        builder.HasIndex(ca => new { ca.TenantId, ca.IsDefault });
        builder.HasIndex(ca => ca.BranchId);
        builder.HasIndex(ca => ca.WarehouseId);
    }
}

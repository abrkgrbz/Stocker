using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Account (Chart of Accounts)
/// </summary>
public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("Accounts", "finance");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.TenantId)
            .IsRequired();

        builder.Property(a => a.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Description)
            .HasMaxLength(500);

        builder.Property(a => a.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        // Money value objects - owned entities
        builder.OwnsOne(a => a.DebitBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DebitBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DebitBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(a => a.CreditBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CreditBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CreditBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(a => a.Balance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Balance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BalanceCurrency").HasMaxLength(3);
        });

        // Self-referencing relationship for parent-child hierarchy
        builder.HasOne(a => a.ParentAccount)
            .WithMany(a => a.SubAccounts)
            .HasForeignKey(a => a.ParentAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => new { a.TenantId, a.Code }).IsUnique();
        builder.HasIndex(a => new { a.TenantId, a.Name });
        builder.HasIndex(a => new { a.TenantId, a.AccountType });
        builder.HasIndex(a => a.ParentAccountId);
        builder.HasIndex(a => a.LinkedBankAccountId);
        builder.HasIndex(a => a.LinkedCashAccountId);
        builder.HasIndex(a => a.LinkedCurrentAccountId);
    }
}

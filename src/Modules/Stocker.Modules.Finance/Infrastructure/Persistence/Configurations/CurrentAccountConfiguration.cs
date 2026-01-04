using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for CurrentAccount
/// </summary>
public class CurrentAccountConfiguration : IEntityTypeConfiguration<CurrentAccount>
{
    public void Configure(EntityTypeBuilder<CurrentAccount> builder)
    {
        builder.ToTable("CurrentAccounts", "finance");

        builder.HasKey(ca => ca.Id);

        builder.Property(ca => ca.TenantId)
            .IsRequired();

        builder.Property(ca => ca.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ca => ca.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ca => ca.ShortName)
            .HasMaxLength(50);

        builder.Property(ca => ca.TaxOffice)
            .HasMaxLength(100);

        builder.Property(ca => ca.TaxNumber)
            .HasMaxLength(11);

        builder.Property(ca => ca.IdentityNumber)
            .HasMaxLength(11);

        builder.Property(ca => ca.TradeRegistryNumber)
            .HasMaxLength(50);

        builder.Property(ca => ca.MersisNumber)
            .HasMaxLength(20);

        builder.Property(ca => ca.EInvoiceAlias)
            .HasMaxLength(100);

        builder.Property(ca => ca.KepAddress)
            .HasMaxLength(255);

        builder.Property(ca => ca.Email)
            .HasMaxLength(255);

        builder.Property(ca => ca.Phone)
            .HasMaxLength(50);

        builder.Property(ca => ca.Fax)
            .HasMaxLength(50);

        builder.Property(ca => ca.Website)
            .HasMaxLength(255);

        builder.Property(ca => ca.Address)
            .HasMaxLength(500);

        builder.Property(ca => ca.District)
            .HasMaxLength(100);

        builder.Property(ca => ca.City)
            .HasMaxLength(100);

        builder.Property(ca => ca.Country)
            .HasMaxLength(100);

        builder.Property(ca => ca.PostalCode)
            .HasMaxLength(20);

        builder.Property(ca => ca.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        // Money value objects - owned entities
        builder.OwnsOne(ca => ca.DebitBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DebitBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DebitBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.CreditBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CreditBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CreditBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.Balance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Balance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.CreditLimit, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CreditLimit").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CreditLimitCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.UsedCredit, money =>
        {
            money.Property(m => m.Amount).HasColumnName("UsedCredit").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("UsedCreditCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ca => ca.AvailableCredit, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AvailableCredit").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AvailableCreditCurrency").HasMaxLength(3);
        });

        builder.Property(ca => ca.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(ca => ca.RiskNotes)
            .HasMaxLength(500);

        builder.Property(ca => ca.Category)
            .HasMaxLength(100);

        builder.Property(ca => ca.Tags)
            .HasMaxLength(500);

        builder.Property(ca => ca.Notes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasMany(ca => ca.Transactions)
            .WithOne(t => t.CurrentAccount)
            .HasForeignKey(t => t.CurrentAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(ca => ca.Invoices)
            .WithOne(i => i.CurrentAccount)
            .HasForeignKey(i => i.CurrentAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ca => ca.ReceivableAccount)
            .WithMany()
            .HasForeignKey(ca => ca.ReceivableAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ca => ca.PayableAccount)
            .WithMany()
            .HasForeignKey(ca => ca.PayableAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(ca => ca.TenantId);
        builder.HasIndex(ca => new { ca.TenantId, ca.Code }).IsUnique();
        builder.HasIndex(ca => new { ca.TenantId, ca.Name });
        builder.HasIndex(ca => new { ca.TenantId, ca.AccountType });
        builder.HasIndex(ca => new { ca.TenantId, ca.Status });
        builder.HasIndex(ca => new { ca.TenantId, ca.TaxNumber });
        builder.HasIndex(ca => ca.CrmCustomerId);
        builder.HasIndex(ca => ca.PurchaseSupplierId);
    }
}

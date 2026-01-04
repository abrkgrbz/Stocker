using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Payment
/// </summary>
public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments", "finance");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.PaymentNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(p => p.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(p => p.CurrentAccountName)
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        // Money value objects
        builder.OwnsOne(p => p.Amount, ConfigureMoney("Amount"));
        builder.OwnsOne(p => p.AmountTRY, ConfigureMoney("AmountTRY"));
        builder.OwnsOne(p => p.Commission, ConfigureMoney("Commission"));
        builder.OwnsOne(p => p.NetAmount, ConfigureMoney("NetAmount"));
        builder.OwnsOne(p => p.AllocatedAmount, ConfigureMoney("AllocatedAmount"));
        builder.OwnsOne(p => p.UnallocatedAmount, ConfigureMoney("UnallocatedAmount"));

        // POS/Credit Card fields
        builder.Property(p => p.CardNumberMasked).HasMaxLength(19);
        builder.Property(p => p.CardholderName).HasMaxLength(100);
        builder.Property(p => p.AuthorizationCode).HasMaxLength(20);
        builder.Property(p => p.PosReferenceNumber).HasMaxLength(50);

        // Reference fields
        builder.Property(p => p.ReferenceNumber).HasMaxLength(50);
        builder.Property(p => p.ReceiptNumber).HasMaxLength(50);

        // Approval fields
        builder.Property(p => p.ApprovalNote).HasMaxLength(500);

        // Other fields
        builder.Property(p => p.Notes).HasMaxLength(2000);

        // Relationships
        builder.HasOne(p => p.CurrentAccount)
            .WithMany()
            .HasForeignKey(p => p.CurrentAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.BankAccount)
            .WithMany()
            .HasForeignKey(p => p.BankAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.CashAccount)
            .WithMany()
            .HasForeignKey(p => p.CashAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.BankTransaction)
            .WithMany()
            .HasForeignKey(p => p.BankTransactionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.CashTransaction)
            .WithMany()
            .HasForeignKey(p => p.CashTransactionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Check)
            .WithMany()
            .HasForeignKey(p => p.CheckId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.PromissoryNote)
            .WithMany()
            .HasForeignKey(p => p.PromissoryNoteId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.JournalEntry)
            .WithMany()
            .HasForeignKey(p => p.JournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.CostCenter)
            .WithMany()
            .HasForeignKey(p => p.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(p => p.Allocations)
            .WithOne(a => a.Payment)
            .HasForeignKey(a => a.PaymentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => new { p.TenantId, p.PaymentNumber }).IsUnique();
        builder.HasIndex(p => new { p.TenantId, p.PaymentDate });
        builder.HasIndex(p => new { p.TenantId, p.Status });
        builder.HasIndex(p => new { p.TenantId, p.Direction });
        builder.HasIndex(p => new { p.TenantId, p.PaymentType });
        builder.HasIndex(p => new { p.TenantId, p.CurrentAccountId });
        builder.HasIndex(p => p.BankAccountId);
        builder.HasIndex(p => p.CashAccountId);
    }

    private static Action<OwnedNavigationBuilder<Payment, Money>> ConfigureMoney(string columnPrefix)
    {
        return money =>
        {
            money.Property(m => m.Amount).HasColumnName(columnPrefix).HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName($"{columnPrefix}Currency").HasMaxLength(3);
        };
    }
}

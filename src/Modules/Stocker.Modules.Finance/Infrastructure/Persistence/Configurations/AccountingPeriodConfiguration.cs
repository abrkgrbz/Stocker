using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for AccountingPeriod
/// </summary>
public class AccountingPeriodConfiguration : IEntityTypeConfiguration<AccountingPeriod>
{
    public void Configure(EntityTypeBuilder<AccountingPeriod> builder)
    {
        builder.ToTable("AccountingPeriods", "finance");

        builder.HasKey(ap => ap.Id);

        builder.Property(ap => ap.TenantId)
            .IsRequired();

        builder.Property(ap => ap.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ap => ap.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ap => ap.Description)
            .HasMaxLength(500);

        builder.Property(ap => ap.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(ap => ap.TotalDebitAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalDebitAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalDebitAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ap => ap.TotalCreditAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalCreditAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalCreditAmountCurrency").HasMaxLength(3);
        });

        // Self-referencing relationships
        builder.HasOne(ap => ap.PreviousPeriod)
            .WithMany()
            .HasForeignKey(ap => ap.PreviousPeriodId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ap => ap.NextPeriod)
            .WithMany()
            .HasForeignKey(ap => ap.NextPeriodId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ap => ap.ClosingJournalEntry)
            .WithMany()
            .HasForeignKey(ap => ap.ClosingJournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ap => ap.OpeningJournalEntry)
            .WithMany()
            .HasForeignKey(ap => ap.OpeningJournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        // Note: JournalEntries relationship is configured in JournalEntryConfiguration

        // Indexes
        builder.HasIndex(ap => ap.TenantId);
        builder.HasIndex(ap => new { ap.TenantId, ap.Code }).IsUnique();
        builder.HasIndex(ap => new { ap.TenantId, ap.FiscalYear });
        builder.HasIndex(ap => new { ap.TenantId, ap.FiscalYear, ap.PeriodNumber });
        builder.HasIndex(ap => new { ap.TenantId, ap.Status });
        builder.HasIndex(ap => new { ap.TenantId, ap.IsActive });
        builder.HasIndex(ap => new { ap.TenantId, ap.StartDate, ap.EndDate });
    }
}

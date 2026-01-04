using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for ExchangeRateAdjustment
/// </summary>
public class ExchangeRateAdjustmentConfiguration : IEntityTypeConfiguration<ExchangeRateAdjustment>
{
    public void Configure(EntityTypeBuilder<ExchangeRateAdjustment> builder)
    {
        builder.ToTable("ExchangeRateAdjustments", "finance");

        builder.HasKey(era => era.Id);

        builder.Property(era => era.TenantId)
            .IsRequired();

        builder.Property(era => era.AdjustmentNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(era => era.SourceCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(era => era.TargetCurrency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(era => era.OriginalRate)
            .HasPrecision(18, 6);

        builder.Property(era => era.ValuationRate)
            .HasPrecision(18, 6);

        builder.Property(era => era.RateChangePercentage)
            .HasPrecision(8, 4);

        builder.Property(era => era.SourceReference)
            .HasMaxLength(100);

        builder.Property(era => era.SourceDescription)
            .HasMaxLength(500);

        builder.Property(era => era.PreparedBy)
            .HasMaxLength(200);

        builder.Property(era => era.ApprovedBy)
            .HasMaxLength(200);

        builder.Property(era => era.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(era => era.SourceAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SourceAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SourceAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(era => era.OriginalValueInTargetCurrency, money =>
        {
            money.Property(m => m.Amount).HasColumnName("OriginalValueInTargetCurrency").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("OriginalValueInTargetCurrencyCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(era => era.CurrentValueInTargetCurrency, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CurrentValueInTargetCurrency").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CurrentValueInTargetCurrencyCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(era => era.ExchangeDifference, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ExchangeDifference").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("ExchangeDifferenceCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasMany(era => era.Details)
            .WithOne(d => d.ExchangeRateAdjustment)
            .HasForeignKey(d => d.ExchangeRateAdjustmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(era => era.TenantId);
        builder.HasIndex(era => new { era.TenantId, era.AdjustmentNumber }).IsUnique();
        builder.HasIndex(era => new { era.TenantId, era.ValuationDate });
        builder.HasIndex(era => new { era.TenantId, era.ValuationType });
        builder.HasIndex(era => new { era.TenantId, era.Status });
        builder.HasIndex(era => new { era.TenantId, era.Direction });
        builder.HasIndex(era => new { era.TenantId, era.IsJournalized });
        builder.HasIndex(era => era.AccountingPeriodId);
        builder.HasIndex(era => era.CurrentAccountId);
        builder.HasIndex(era => era.BankAccountId);
        builder.HasIndex(era => era.JournalEntryId);
    }
}

/// <summary>
/// Entity configuration for ExchangeRateAdjustmentDetail
/// </summary>
public class ExchangeRateAdjustmentDetailConfiguration : IEntityTypeConfiguration<ExchangeRateAdjustmentDetail>
{
    public void Configure(EntityTypeBuilder<ExchangeRateAdjustmentDetail> builder)
    {
        builder.ToTable("ExchangeRateAdjustmentDetails", "finance");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.TenantId)
            .IsRequired();

        builder.Property(d => d.SourceCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(d => d.OriginalRate)
            .HasPrecision(18, 6);

        builder.Property(d => d.ValuationRate)
            .HasPrecision(18, 6);

        builder.Property(d => d.SourceReference)
            .HasMaxLength(100);

        builder.Property(d => d.Description)
            .HasMaxLength(500);

        // Money value objects - owned entities
        builder.OwnsOne(d => d.SourceAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SourceAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SourceAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(d => d.OriginalValueInTargetCurrency, money =>
        {
            money.Property(m => m.Amount).HasColumnName("OriginalValueInTargetCurrency").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("OriginalValueInTargetCurrencyCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(d => d.CurrentValueInTargetCurrency, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CurrentValueInTargetCurrency").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CurrentValueInTargetCurrencyCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(d => d.ExchangeDifference, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ExchangeDifference").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("ExchangeDifferenceCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(d => d.ExchangeRateAdjustment)
            .WithMany(era => era.Details)
            .HasForeignKey(d => d.ExchangeRateAdjustmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(d => d.TenantId);
        builder.HasIndex(d => d.ExchangeRateAdjustmentId);
        builder.HasIndex(d => new { d.TenantId, d.SourceType });
        builder.HasIndex(d => new { d.TenantId, d.Direction });
        builder.HasIndex(d => d.SourceEntityId);
        builder.HasIndex(d => d.AccountId);
    }
}

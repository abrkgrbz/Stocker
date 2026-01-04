using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for ExchangeRate
/// </summary>
public class ExchangeRateConfiguration : IEntityTypeConfiguration<ExchangeRate>
{
    public void Configure(EntityTypeBuilder<ExchangeRate> builder)
    {
        builder.ToTable("ExchangeRates", "finance");

        builder.HasKey(er => er.Id);

        builder.Property(er => er.TenantId)
            .IsRequired();

        builder.Property(er => er.SourceCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(er => er.TargetCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(er => er.CurrencyIsoCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(er => er.CurrencyName)
            .HasMaxLength(100);

        builder.Property(er => er.CurrencyNameTurkish)
            .HasMaxLength(100);

        builder.Property(er => er.TcmbBulletinNumber)
            .HasMaxLength(50);

        builder.Property(er => er.Notes)
            .HasMaxLength(2000);

        // Rate values
        builder.Property(er => er.ForexBuying)
            .HasPrecision(18, 6);

        builder.Property(er => er.ForexSelling)
            .HasPrecision(18, 6);

        builder.Property(er => er.BanknoteBuying)
            .HasPrecision(18, 6);

        builder.Property(er => er.BanknoteSelling)
            .HasPrecision(18, 6);

        builder.Property(er => er.AverageRate)
            .HasPrecision(18, 6);

        builder.Property(er => er.CrossRate)
            .HasPrecision(18, 6);

        builder.Property(er => er.PreviousRate)
            .HasPrecision(18, 6);

        builder.Property(er => er.ChangeAmount)
            .HasPrecision(18, 6);

        builder.Property(er => er.ChangePercentage)
            .HasPrecision(8, 4);

        // Indexes
        builder.HasIndex(er => er.TenantId);
        builder.HasIndex(er => new { er.TenantId, er.SourceCurrency, er.TargetCurrency, er.RateDate }).IsUnique();
        builder.HasIndex(er => new { er.TenantId, er.RateDate });
        builder.HasIndex(er => new { er.TenantId, er.RateType });
        builder.HasIndex(er => new { er.TenantId, er.Source });
        builder.HasIndex(er => new { er.TenantId, er.IsActive });
        builder.HasIndex(er => new { er.TenantId, er.IsDefaultForDate });
        builder.HasIndex(er => new { er.TenantId, er.IsTcmbRate });
    }
}

/// <summary>
/// Entity configuration for Currency
/// </summary>
public class CurrencyConfiguration : IEntityTypeConfiguration<Currency>
{
    public void Configure(EntityTypeBuilder<Currency> builder)
    {
        builder.ToTable("Currencies", "finance");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.IsoCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(c => c.NumericCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.NameTurkish)
            .HasMaxLength(100);

        builder.Property(c => c.Symbol)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(c => c.Country)
            .HasMaxLength(100);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => new { c.TenantId, c.IsoCode }).IsUnique();
        builder.HasIndex(c => new { c.TenantId, c.IsActive });
        builder.HasIndex(c => new { c.TenantId, c.IsBaseCurrency });
        builder.HasIndex(c => new { c.TenantId, c.SortOrder });
    }
}

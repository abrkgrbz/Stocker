using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Döviz Kuru DTO (Exchange Rate DTO)
/// </summary>
public class ExchangeRateDto
{
    public int Id { get; set; }

    // Temel Bilgiler (Basic Information)
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = string.Empty;
    public string CurrencyIsoCode { get; set; } = string.Empty;
    public DateTime RateDate { get; set; }
    public ExchangeRateType RateType { get; set; }
    public string RateTypeName { get; set; } = string.Empty;

    // Kur Değerleri (Rate Values)
    public decimal? ForexBuying { get; set; }
    public decimal? ForexSelling { get; set; }
    public decimal? BanknoteBuying { get; set; }
    public decimal? BanknoteSelling { get; set; }
    public decimal AverageRate { get; set; }
    public decimal? CrossRate { get; set; }
    public int Unit { get; set; } = 1;

    // TCMB Bilgileri (TCMB Information)
    public bool IsTcmbRate { get; set; }
    public string? TcmbBulletinNumber { get; set; }
    public string? CurrencyName { get; set; }
    public string? CurrencyNameTurkish { get; set; }

    // Değişim Bilgileri (Change Information)
    public decimal? PreviousRate { get; set; }
    public decimal? ChangeAmount { get; set; }
    public decimal? ChangePercentage { get; set; }
    public ExchangeRateTrend Trend { get; set; }
    public string TrendName { get; set; } = string.Empty;

    // Kaynak Bilgileri (Source Information)
    public ExchangeRateSource Source { get; set; }
    public string SourceName { get; set; } = string.Empty;
    public bool IsManualEntry { get; set; }
    public DateTime? IntegrationDate { get; set; }
    public int? EnteredByUserId { get; set; }

    // Durum Bilgileri (Status Information)
    public bool IsActive { get; set; }
    public bool IsValid { get; set; }
    public bool IsDefaultForDate { get; set; }
    public string? Notes { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Döviz Kuru Özet DTO (Exchange Rate Summary DTO)
/// </summary>
public class ExchangeRateSummaryDto
{
    public int Id { get; set; }
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = string.Empty;
    public DateTime RateDate { get; set; }
    public ExchangeRateType RateType { get; set; }
    public string RateTypeName { get; set; } = string.Empty;
    public decimal? ForexBuying { get; set; }
    public decimal? ForexSelling { get; set; }
    public decimal AverageRate { get; set; }
    public int Unit { get; set; }
    public ExchangeRateSource Source { get; set; }
    public string SourceName { get; set; } = string.Empty;
    public ExchangeRateTrend Trend { get; set; }
    public decimal? ChangePercentage { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefaultForDate { get; set; }
}

/// <summary>
/// Döviz Kuru Filtre DTO (Exchange Rate Filter DTO)
/// </summary>
public class ExchangeRateFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public string? SourceCurrency { get; set; }
    public string? TargetCurrency { get; set; }
    public ExchangeRateType? RateType { get; set; }
    public ExchangeRateSource? Source { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsTcmbRate { get; set; }
    public bool? IsManualEntry { get; set; }
    public bool? IsDefaultForDate { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Döviz Kuru Oluşturma DTO (Create Exchange Rate DTO)
/// </summary>
public class CreateExchangeRateDto
{
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = string.Empty;
    public DateTime RateDate { get; set; }
    public decimal AverageRate { get; set; }
    public ExchangeRateType RateType { get; set; } = ExchangeRateType.Daily;
    public ExchangeRateSource Source { get; set; } = ExchangeRateSource.Manual;
    public int Unit { get; set; } = 1;
    public decimal? ForexBuying { get; set; }
    public decimal? ForexSelling { get; set; }
    public decimal? BanknoteBuying { get; set; }
    public decimal? BanknoteSelling { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// TCMB Döviz Kuru Oluşturma DTO (Create TCMB Exchange Rate DTO)
/// </summary>
public class CreateTcmbRateDto
{
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal ForexBuying { get; set; }
    public decimal ForexSelling { get; set; }
    public decimal? BanknoteBuying { get; set; }
    public decimal? BanknoteSelling { get; set; }
    public string? BulletinNumber { get; set; }
    public int Unit { get; set; } = 1;
    public string? CurrencyName { get; set; }
    public string? CurrencyNameTurkish { get; set; }
}

/// <summary>
/// Manuel Döviz Kuru Oluşturma DTO (Create Manual Exchange Rate DTO)
/// </summary>
public class CreateManualRateDto
{
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal Rate { get; set; }
    public int UserId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Döviz Kuru Güncelleme DTO (Update Exchange Rate DTO)
/// </summary>
public class UpdateExchangeRateDto
{
    public decimal? ForexBuying { get; set; }
    public decimal? ForexSelling { get; set; }
    public decimal? BanknoteBuying { get; set; }
    public decimal? BanknoteSelling { get; set; }
    public decimal? AverageRate { get; set; }
    public decimal? CrossRate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Döviz/Efektif Kur Ayarlama DTO (Set Forex/Banknote Rates DTO)
/// </summary>
public class SetRatesDto
{
    public decimal? Buying { get; set; }
    public decimal? Selling { get; set; }
}

/// <summary>
/// Para Birimi Çevirme İsteği DTO (Currency Conversion Request DTO)
/// </summary>
public class CurrencyConversionRequestDto
{
    public decimal Amount { get; set; }
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = string.Empty;
    public DateTime? RateDate { get; set; }
    public bool UseBuyingRate { get; set; }
}

/// <summary>
/// Para Birimi Çevirme Sonucu DTO (Currency Conversion Result DTO)
/// </summary>
public class CurrencyConversionResultDto
{
    public decimal SourceAmount { get; set; }
    public string SourceCurrency { get; set; } = string.Empty;
    public decimal ConvertedAmount { get; set; }
    public string TargetCurrency { get; set; } = string.Empty;
    public decimal ExchangeRate { get; set; }
    public DateTime RateDate { get; set; }
    public ExchangeRateSource RateSource { get; set; }
}

/// <summary>
/// Para Birimi DTO (Currency DTO)
/// </summary>
public class CurrencyDto
{
    public int Id { get; set; }
    public string IsoCode { get; set; } = string.Empty;
    public string NumericCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameTurkish { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public int DecimalPlaces { get; set; }
    public string? Country { get; set; }
    public bool IsActive { get; set; }
    public bool IsBaseCurrency { get; set; }
    public int SortOrder { get; set; }
}

/// <summary>
/// Para Birimi Özet DTO (Currency Summary DTO)
/// </summary>
public class CurrencySummaryDto
{
    public int Id { get; set; }
    public string IsoCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameTurkish { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsBaseCurrency { get; set; }
}

/// <summary>
/// Para Birimi Filtre DTO (Currency Filter DTO)
/// </summary>
public class CurrencyFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsBaseCurrency { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

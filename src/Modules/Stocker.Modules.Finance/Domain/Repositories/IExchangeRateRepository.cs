using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for ExchangeRate entity
/// Döviz Kuru repository arayüzü
/// </summary>
public interface IExchangeRateRepository : IFinanceRepository<ExchangeRate>
{
    /// <summary>
    /// Get exchange rate for a specific date and currency pair
    /// Belirli bir tarih ve döviz çifti için kur getirir
    /// </summary>
    Task<ExchangeRate?> GetRateAsync(string sourceCurrency, string targetCurrency, DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get latest exchange rate for a currency pair
    /// Bir döviz çifti için en güncel kuru getirir
    /// </summary>
    Task<ExchangeRate?> GetLatestRateAsync(string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get exchange rates for a date range
    /// Tarih aralığı için kurları getirir
    /// </summary>
    Task<IReadOnlyList<ExchangeRate>> GetByDateRangeAsync(string sourceCurrency, string targetCurrency, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get exchange rates for a specific date
    /// Belirli bir tarih için tüm kurları getirir
    /// </summary>
    Task<IReadOnlyList<ExchangeRate>> GetByDateAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get exchange rates by source
    /// Kaynağa göre kurları getirir
    /// </summary>
    Task<IReadOnlyList<ExchangeRate>> GetBySourceAsync(ExchangeRateSource source, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get TCMB rates for a date
    /// TCMB kurlarını getirir
    /// </summary>
    Task<IReadOnlyList<ExchangeRate>> GetTcmbRatesAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get default rate for a date
    /// Belirli bir tarih için varsayılan kuru getirir
    /// </summary>
    Task<ExchangeRate?> GetDefaultRateForDateAsync(string sourceCurrency, string targetCurrency, DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get active currencies with rates
    /// Kuru olan aktif dövizleri getirir
    /// </summary>
    Task<IReadOnlyList<string>> GetActiveCurrenciesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if rate exists for date
    /// Belirli bir tarih için kur var mı kontrol eder
    /// </summary>
    Task<bool> RateExistsAsync(string sourceCurrency, string targetCurrency, DateTime date, CancellationToken cancellationToken = default);
}

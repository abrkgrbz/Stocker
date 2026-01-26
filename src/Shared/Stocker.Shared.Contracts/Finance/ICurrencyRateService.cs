namespace Stocker.Shared.Contracts.Finance;

/// <summary>
/// Cross-module contract for currency rate operations.
/// Provides exchange rate lookup with staleness protection.
/// Modüller arası döviz kuru operasyonları sözleşmesi - bayat veri koruması ile
/// </summary>
public interface ICurrencyRateService
{
    /// <summary>
    /// Gets the exchange rate for converting from source to target currency.
    /// Throws StaleDataException if rate data is older than maxAge.
    /// </summary>
    /// <param name="sourceCurrency">Source currency code (e.g., "USD")</param>
    /// <param name="targetCurrency">Target currency code (e.g., "TRY")</param>
    /// <param name="maxAge">Maximum allowed age for the rate data (default: 4 hours)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Exchange rate result with rate value and metadata</returns>
    Task<ExchangeRateResult> GetRateAsync(
        string sourceCurrency,
        string targetCurrency,
        TimeSpan? maxAge = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the exchange rate for a specific date.
    /// Useful for historical transactions or reporting.
    /// </summary>
    Task<ExchangeRateResult> GetRateForDateAsync(
        string sourceCurrency,
        string targetCurrency,
        DateTime date,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Converts an amount from source to target currency.
    /// Throws StaleDataException if rate data is stale.
    /// </summary>
    /// <param name="amount">Amount to convert</param>
    /// <param name="sourceCurrency">Source currency code</param>
    /// <param name="targetCurrency">Target currency code</param>
    /// <param name="maxAge">Maximum allowed age for the rate data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Converted amount with rate information</returns>
    Task<CurrencyConversionResult> ConvertAsync(
        decimal amount,
        string sourceCurrency,
        string targetCurrency,
        TimeSpan? maxAge = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if the exchange rate data is fresh (not stale).
    /// Does not throw exception, returns boolean.
    /// </summary>
    Task<bool> IsRateFreshAsync(
        string sourceCurrency,
        string targetCurrency,
        TimeSpan maxAge,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the last update time for exchange rates.
    /// </summary>
    Task<DateTime?> GetLastUpdateTimeAsync(
        string sourceCurrency,
        string targetCurrency,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of exchange rate lookup
/// </summary>
public record ExchangeRateResult
{
    /// <summary>
    /// Whether the rate was found and is valid
    /// </summary>
    public bool IsSuccess { get; init; }

    /// <summary>
    /// The exchange rate value (source to target)
    /// </summary>
    public decimal Rate { get; init; }

    /// <summary>
    /// Source currency code
    /// </summary>
    public string SourceCurrency { get; init; } = string.Empty;

    /// <summary>
    /// Target currency code
    /// </summary>
    public string TargetCurrency { get; init; } = string.Empty;

    /// <summary>
    /// When the rate was last updated
    /// </summary>
    public DateTime LastUpdated { get; init; }

    /// <summary>
    /// Rate date (for historical rates)
    /// </summary>
    public DateTime RateDate { get; init; }

    /// <summary>
    /// Source of the rate (TCMB, Manual, etc.)
    /// </summary>
    public string Source { get; init; } = string.Empty;

    /// <summary>
    /// Whether the rate is considered fresh
    /// </summary>
    public bool IsFresh { get; init; }

    /// <summary>
    /// Age of the rate data
    /// </summary>
    public TimeSpan Age => DateTime.UtcNow - LastUpdated;

    /// <summary>
    /// Error message if not successful
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Creates a successful result
    /// </summary>
    public static ExchangeRateResult Success(
        decimal rate,
        string sourceCurrency,
        string targetCurrency,
        DateTime lastUpdated,
        DateTime rateDate,
        string source,
        bool isFresh) => new()
    {
        IsSuccess = true,
        Rate = rate,
        SourceCurrency = sourceCurrency,
        TargetCurrency = targetCurrency,
        LastUpdated = lastUpdated,
        RateDate = rateDate,
        Source = source,
        IsFresh = isFresh
    };

    /// <summary>
    /// Creates a failure result
    /// </summary>
    public static ExchangeRateResult Failure(string errorMessage) => new()
    {
        IsSuccess = false,
        ErrorMessage = errorMessage
    };
}

/// <summary>
/// Result of currency conversion
/// </summary>
public record CurrencyConversionResult
{
    /// <summary>
    /// Whether the conversion was successful
    /// </summary>
    public bool IsSuccess { get; init; }

    /// <summary>
    /// Original amount
    /// </summary>
    public decimal OriginalAmount { get; init; }

    /// <summary>
    /// Converted amount
    /// </summary>
    public decimal ConvertedAmount { get; init; }

    /// <summary>
    /// Exchange rate used for conversion
    /// </summary>
    public decimal Rate { get; init; }

    /// <summary>
    /// Source currency code
    /// </summary>
    public string SourceCurrency { get; init; } = string.Empty;

    /// <summary>
    /// Target currency code
    /// </summary>
    public string TargetCurrency { get; init; } = string.Empty;

    /// <summary>
    /// When the rate was last updated
    /// </summary>
    public DateTime RateLastUpdated { get; init; }

    /// <summary>
    /// Error message if not successful
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Creates a successful result
    /// </summary>
    public static CurrencyConversionResult Success(
        decimal originalAmount,
        decimal convertedAmount,
        decimal rate,
        string sourceCurrency,
        string targetCurrency,
        DateTime rateLastUpdated) => new()
    {
        IsSuccess = true,
        OriginalAmount = originalAmount,
        ConvertedAmount = convertedAmount,
        Rate = rate,
        SourceCurrency = sourceCurrency,
        TargetCurrency = targetCurrency,
        RateLastUpdated = rateLastUpdated
    };

    /// <summary>
    /// Creates a failure result
    /// </summary>
    public static CurrencyConversionResult Failure(string errorMessage) => new()
    {
        IsSuccess = false,
        ErrorMessage = errorMessage
    };
}

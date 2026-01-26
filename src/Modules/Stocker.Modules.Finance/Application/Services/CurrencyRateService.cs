using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.Shared.Contracts.Finance;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.Modules.Finance.Application.Services;

/// <summary>
/// Implementation of ICurrencyRateService for cross-module currency operations.
/// Includes staleness protection to prevent transactions with outdated exchange rates.
/// Modüller arası döviz kuru operasyonları - bayat veri koruması ile
/// </summary>
public class CurrencyRateService : ICurrencyRateService
{
    private readonly IFinanceUnitOfWork _unitOfWork;
    private readonly ILogger<CurrencyRateService> _logger;

    /// <summary>
    /// Default maximum age for exchange rate data (4 hours)
    /// Döviz kuru için varsayılan maksimum yaş (4 saat)
    /// </summary>
    private static readonly TimeSpan DefaultMaxAge = TimeSpan.FromHours(4);

    /// <summary>
    /// Critical threshold - if data is older than this, log critical error
    /// Kritik eşik - veri bundan eskiyse kritik hata logla
    /// </summary>
    private static readonly TimeSpan CriticalThreshold = TimeSpan.FromHours(24);

    public CurrencyRateService(
        IFinanceUnitOfWork unitOfWork,
        ILogger<CurrencyRateService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ExchangeRateResult> GetRateAsync(
        string sourceCurrency,
        string targetCurrency,
        TimeSpan? maxAge = null,
        CancellationToken cancellationToken = default)
    {
        var effectiveMaxAge = maxAge ?? DefaultMaxAge;

        try
        {
            // Normalize currency codes
            sourceCurrency = sourceCurrency.ToUpperInvariant();
            targetCurrency = targetCurrency.ToUpperInvariant();

            // Same currency - rate is 1
            if (sourceCurrency == targetCurrency)
            {
                return ExchangeRateResult.Success(
                    rate: 1m,
                    sourceCurrency: sourceCurrency,
                    targetCurrency: targetCurrency,
                    lastUpdated: DateTime.UtcNow,
                    rateDate: DateTime.UtcNow.Date,
                    source: "System",
                    isFresh: true);
            }

            // Get latest rate from repository
            var rate = await _unitOfWork.ExchangeRates.GetLatestRateAsync(
                sourceCurrency, targetCurrency, cancellationToken);

            if (rate is null)
            {
                _logger.LogWarning(
                    "Exchange rate not found for {SourceCurrency}/{TargetCurrency}",
                    sourceCurrency, targetCurrency);

                return ExchangeRateResult.Failure(
                    $"Exchange rate not found for {sourceCurrency}/{targetCurrency}");
            }

            // Check staleness
            var age = DateTime.UtcNow - GetLastModifiedDate(rate);
            var isFresh = age <= effectiveMaxAge;

            // Log warnings/errors based on staleness
            if (age > CriticalThreshold)
            {
                _logger.LogCritical(
                    "EXCHANGE RATE DATA IS CRITICALLY STALE! " +
                    "Currency: {SourceCurrency}/{TargetCurrency}, " +
                    "Last Updated: {LastUpdate}, Age: {Age} hours. " +
                    "Exchange rate integration service may not be running!",
                    sourceCurrency, targetCurrency, GetLastModifiedDate(rate), age.TotalHours);

                throw new StaleDataException("ExchangeRate", GetLastModifiedDate(rate), effectiveMaxAge);
            }
            else if (!isFresh)
            {
                _logger.LogWarning(
                    "Exchange rate data is stale. Currency: {SourceCurrency}/{TargetCurrency}, " +
                    "Last Updated: {LastUpdate}, Age: {Age} hours, MaxAge: {MaxAge} hours",
                    sourceCurrency, targetCurrency, GetLastModifiedDate(rate), age.TotalHours, effectiveMaxAge.TotalHours);

                throw new StaleDataException("ExchangeRate", GetLastModifiedDate(rate), effectiveMaxAge);
            }

            _logger.LogDebug(
                "Exchange rate retrieved: {SourceCurrency}/{TargetCurrency} = {Rate}, " +
                "Last Updated: {LastUpdate}",
                sourceCurrency, targetCurrency, rate.AverageRate, GetLastModifiedDate(rate));

            return ExchangeRateResult.Success(
                rate: rate.AverageRate,
                sourceCurrency: rate.SourceCurrency,
                targetCurrency: rate.TargetCurrency,
                lastUpdated: GetLastModifiedDate(rate),
                rateDate: rate.RateDate,
                source: rate.Source.ToString(),
                isFresh: isFresh);
        }
        catch (StaleDataException)
        {
            throw; // Re-throw staleness exceptions
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error getting exchange rate for {SourceCurrency}/{TargetCurrency}",
                sourceCurrency, targetCurrency);

            return ExchangeRateResult.Failure($"Error getting exchange rate: {ex.Message}");
        }
    }

    public async Task<ExchangeRateResult> GetRateForDateAsync(
        string sourceCurrency,
        string targetCurrency,
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        try
        {
            sourceCurrency = sourceCurrency.ToUpperInvariant();
            targetCurrency = targetCurrency.ToUpperInvariant();

            if (sourceCurrency == targetCurrency)
            {
                return ExchangeRateResult.Success(
                    rate: 1m,
                    sourceCurrency: sourceCurrency,
                    targetCurrency: targetCurrency,
                    lastUpdated: DateTime.UtcNow,
                    rateDate: date.Date,
                    source: "System",
                    isFresh: true);
            }

            var rate = await _unitOfWork.ExchangeRates.GetRateAsync(
                sourceCurrency, targetCurrency, date.Date, cancellationToken);

            if (rate is null)
            {
                // Try to get closest rate
                rate = await _unitOfWork.ExchangeRates.GetDefaultRateForDateAsync(
                    sourceCurrency, targetCurrency, date.Date, cancellationToken);
            }

            if (rate is null)
            {
                return ExchangeRateResult.Failure(
                    $"Exchange rate not found for {sourceCurrency}/{targetCurrency} on {date:yyyy-MM-dd}");
            }

            return ExchangeRateResult.Success(
                rate: rate.AverageRate,
                sourceCurrency: rate.SourceCurrency,
                targetCurrency: rate.TargetCurrency,
                lastUpdated: GetLastModifiedDate(rate),
                rateDate: rate.RateDate,
                source: rate.Source.ToString(),
                isFresh: true); // Historical rates are always considered "fresh" for their date
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error getting exchange rate for {SourceCurrency}/{TargetCurrency} on {Date}",
                sourceCurrency, targetCurrency, date);

            return ExchangeRateResult.Failure($"Error getting exchange rate: {ex.Message}");
        }
    }

    public async Task<CurrencyConversionResult> ConvertAsync(
        decimal amount,
        string sourceCurrency,
        string targetCurrency,
        TimeSpan? maxAge = null,
        CancellationToken cancellationToken = default)
    {
        var rateResult = await GetRateAsync(sourceCurrency, targetCurrency, maxAge, cancellationToken);

        if (!rateResult.IsSuccess)
        {
            return CurrencyConversionResult.Failure(
                rateResult.ErrorMessage ?? "Failed to get exchange rate");
        }

        var convertedAmount = amount * rateResult.Rate;

        _logger.LogDebug(
            "Currency conversion: {OriginalAmount} {SourceCurrency} -> {ConvertedAmount} {TargetCurrency} " +
            "(Rate: {Rate})",
            amount, sourceCurrency, convertedAmount, targetCurrency, rateResult.Rate);

        return CurrencyConversionResult.Success(
            originalAmount: amount,
            convertedAmount: convertedAmount,
            rate: rateResult.Rate,
            sourceCurrency: rateResult.SourceCurrency,
            targetCurrency: rateResult.TargetCurrency,
            rateLastUpdated: rateResult.LastUpdated);
    }

    public async Task<bool> IsRateFreshAsync(
        string sourceCurrency,
        string targetCurrency,
        TimeSpan maxAge,
        CancellationToken cancellationToken = default)
    {
        try
        {
            sourceCurrency = sourceCurrency.ToUpperInvariant();
            targetCurrency = targetCurrency.ToUpperInvariant();

            if (sourceCurrency == targetCurrency)
            {
                return true;
            }

            var rate = await _unitOfWork.ExchangeRates.GetLatestRateAsync(
                sourceCurrency, targetCurrency, cancellationToken);

            if (rate is null)
            {
                return false;
            }

            var age = DateTime.UtcNow - GetLastModifiedDate(rate);
            return age <= maxAge;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error checking rate freshness for {SourceCurrency}/{TargetCurrency}",
                sourceCurrency, targetCurrency);
            return false;
        }
    }

    public async Task<DateTime?> GetLastUpdateTimeAsync(
        string sourceCurrency,
        string targetCurrency,
        CancellationToken cancellationToken = default)
    {
        try
        {
            sourceCurrency = sourceCurrency.ToUpperInvariant();
            targetCurrency = targetCurrency.ToUpperInvariant();

            if (sourceCurrency == targetCurrency)
            {
                return DateTime.UtcNow;
            }

            var rate = await _unitOfWork.ExchangeRates.GetLatestRateAsync(
                sourceCurrency, targetCurrency, cancellationToken);

            return rate is not null ? GetLastModifiedDate(rate) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error getting last update time for {SourceCurrency}/{TargetCurrency}",
                sourceCurrency, targetCurrency);
            return null;
        }
    }

    /// <summary>
    /// Gets the last modified date from an ExchangeRate entity.
    /// Uses UpdatedDate if available, otherwise falls back to CreatedDate.
    /// </summary>
    private static DateTime GetLastModifiedDate(ExchangeRate rate)
    {
        return rate.UpdatedDate ?? rate.CreatedDate;
    }
}

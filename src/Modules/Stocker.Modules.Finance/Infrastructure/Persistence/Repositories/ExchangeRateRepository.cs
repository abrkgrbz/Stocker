using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for ExchangeRate entity
/// Döviz Kuru repository implementasyonu
/// </summary>
public class ExchangeRateRepository : FinanceGenericRepository<ExchangeRate>, IExchangeRateRepository
{
    public ExchangeRateRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<ExchangeRate?> GetRateAsync(string sourceCurrency, string targetCurrency, DateTime date, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.SourceCurrency == sourceCurrency.ToUpperInvariant() &&
                        r.TargetCurrency == targetCurrency.ToUpperInvariant() &&
                        r.RateDate.Date == date.Date &&
                        r.IsActive)
            .OrderByDescending(r => r.IsDefaultForDate)
            .ThenByDescending(r => r.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ExchangeRate?> GetLatestRateAsync(string sourceCurrency, string targetCurrency, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.SourceCurrency == sourceCurrency.ToUpperInvariant() &&
                        r.TargetCurrency == targetCurrency.ToUpperInvariant() &&
                        r.IsActive)
            .OrderByDescending(r => r.RateDate)
            .ThenByDescending(r => r.IsDefaultForDate)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ExchangeRate>> GetByDateRangeAsync(string sourceCurrency, string targetCurrency, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.SourceCurrency == sourceCurrency.ToUpperInvariant() &&
                        r.TargetCurrency == targetCurrency.ToUpperInvariant() &&
                        r.RateDate.Date >= startDate.Date &&
                        r.RateDate.Date <= endDate.Date &&
                        r.IsActive)
            .OrderByDescending(r => r.RateDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ExchangeRate>> GetByDateAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.RateDate.Date == date.Date && r.IsActive)
            .OrderBy(r => r.SourceCurrency)
            .ThenBy(r => r.TargetCurrency)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ExchangeRate>> GetBySourceAsync(ExchangeRateSource source, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.Source == source && r.IsActive)
            .OrderByDescending(r => r.RateDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ExchangeRate>> GetTcmbRatesAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.IsTcmbRate &&
                        r.RateDate.Date == date.Date &&
                        r.IsActive)
            .OrderBy(r => r.SourceCurrency)
            .ToListAsync(cancellationToken);
    }

    public async Task<ExchangeRate?> GetDefaultRateForDateAsync(string sourceCurrency, string targetCurrency, DateTime date, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.SourceCurrency == sourceCurrency.ToUpperInvariant() &&
                        r.TargetCurrency == targetCurrency.ToUpperInvariant() &&
                        r.RateDate.Date == date.Date &&
                        r.IsDefaultForDate &&
                        r.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<string>> GetActiveCurrenciesAsync(CancellationToken cancellationToken = default)
    {
        var sourceCurrencies = await _dbSet
            .Where(r => r.IsActive)
            .Select(r => r.SourceCurrency)
            .Distinct()
            .ToListAsync(cancellationToken);

        var targetCurrencies = await _dbSet
            .Where(r => r.IsActive)
            .Select(r => r.TargetCurrency)
            .Distinct()
            .ToListAsync(cancellationToken);

        return sourceCurrencies
            .Union(targetCurrencies)
            .Distinct()
            .OrderBy(c => c)
            .ToList();
    }

    public async Task<bool> RateExistsAsync(string sourceCurrency, string targetCurrency, DateTime date, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AnyAsync(r => r.SourceCurrency == sourceCurrency.ToUpperInvariant() &&
                          r.TargetCurrency == targetCurrency.ToUpperInvariant() &&
                          r.RateDate.Date == date.Date &&
                          r.IsActive,
                      cancellationToken);
    }
}

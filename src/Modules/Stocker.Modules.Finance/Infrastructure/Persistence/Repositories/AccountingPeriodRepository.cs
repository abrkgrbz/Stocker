using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for AccountingPeriod entity
/// Muhasebe Dönemi repository implementasyonu
/// </summary>
public class AccountingPeriodRepository : FinanceGenericRepository<AccountingPeriod>, IAccountingPeriodRepository
{
    public AccountingPeriodRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<AccountingPeriod?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.Code == code, cancellationToken);
    }

    public async Task<IReadOnlyList<AccountingPeriod>> GetByFiscalYearAsync(int fiscalYear, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.FiscalYear == fiscalYear)
            .OrderBy(p => p.PeriodNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<AccountingPeriod?> GetCurrentPeriodAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await _dbSet
            .Where(p => p.Status == AccountingPeriodStatus.Open &&
                        p.StartDate <= today &&
                        p.EndDate >= today)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<AccountingPeriod?> GetPeriodForDateAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.StartDate <= date.Date && p.EndDate >= date.Date)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AccountingPeriod>> GetByStatusAsync(AccountingPeriodStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.Status == status)
            .OrderByDescending(p => p.FiscalYear)
            .ThenBy(p => p.PeriodNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AccountingPeriod>> GetOpenPeriodsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.Status == AccountingPeriodStatus.Open)
            .OrderByDescending(p => p.FiscalYear)
            .ThenBy(p => p.PeriodNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AccountingPeriod>> GetClosedPeriodsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.Status == AccountingPeriodStatus.HardClosed)
            .OrderByDescending(p => p.FiscalYear)
            .ThenBy(p => p.PeriodNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AccountingPeriod>> GetByTypeAsync(AccountingPeriodType periodType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.PeriodType == periodType)
            .OrderByDescending(p => p.FiscalYear)
            .ThenBy(p => p.PeriodNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsDateInOpenPeriodAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AnyAsync(p => p.Status == AccountingPeriodStatus.Open &&
                          p.StartDate <= date.Date &&
                          p.EndDate >= date.Date,
                      cancellationToken);
    }

    public async Task<AccountingPeriod?> GetYearEndPeriodAsync(int fiscalYear, CancellationToken cancellationToken = default)
    {
        // Get the Annual period as year-end
        return await _dbSet
            .Where(p => p.FiscalYear == fiscalYear &&
                        p.PeriodType == AccountingPeriodType.Annual)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> GetNextPeriodNumberAsync(int fiscalYear, CancellationToken cancellationToken = default)
    {
        var maxPeriodNumber = await _dbSet
            .Where(p => p.FiscalYear == fiscalYear)
            .MaxAsync(p => (int?)p.PeriodNumber, cancellationToken);

        return (maxPeriodNumber ?? 0) + 1;
    }

    public async Task<AccountingPeriod?> GetByFiscalYearAndPeriodNumberAsync(int fiscalYear, int periodNumber, AccountingPeriodType periodType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.FiscalYear == fiscalYear &&
                        p.PeriodNumber == periodNumber &&
                        p.PeriodType == periodType)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<AccountingPeriod?> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.IsActive && p.Status == AccountingPeriodStatus.Open)
            .OrderByDescending(p => p.FiscalYear)
            .ThenByDescending(p => p.PeriodNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<AccountingPeriod?> GetByDateAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.StartDate <= date.Date && p.EndDate >= date.Date)
            .FirstOrDefaultAsync(cancellationToken);
    }
}

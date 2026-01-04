using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for AccountingPeriod entity
/// Muhasebe Dönemi repository arayüzü
/// </summary>
public interface IAccountingPeriodRepository : IFinanceRepository<AccountingPeriod>
{
    /// <summary>
    /// Get period by code
    /// Kod ile dönem getirir
    /// </summary>
    Task<AccountingPeriod?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get periods by fiscal year
    /// Mali yıla göre dönemleri getirir
    /// </summary>
    Task<IReadOnlyList<AccountingPeriod>> GetByFiscalYearAsync(int fiscalYear, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get current active period
    /// Aktif dönemi getirir
    /// </summary>
    Task<AccountingPeriod?> GetCurrentPeriodAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get period for a specific date
    /// Belirli bir tarih için dönemi getirir
    /// </summary>
    Task<AccountingPeriod?> GetPeriodForDateAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get periods by status
    /// Duruma göre dönemleri getirir
    /// </summary>
    Task<IReadOnlyList<AccountingPeriod>> GetByStatusAsync(AccountingPeriodStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get open periods
    /// Açık dönemleri getirir
    /// </summary>
    Task<IReadOnlyList<AccountingPeriod>> GetOpenPeriodsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get closed periods
    /// Kapalı dönemleri getirir
    /// </summary>
    Task<IReadOnlyList<AccountingPeriod>> GetClosedPeriodsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get periods by type
    /// Türe göre dönemleri getirir
    /// </summary>
    Task<IReadOnlyList<AccountingPeriod>> GetByTypeAsync(AccountingPeriodType periodType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a date is within an open period
    /// Bir tarihin açık dönemde olup olmadığını kontrol eder
    /// </summary>
    Task<bool> IsDateInOpenPeriodAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get year-end period for fiscal year
    /// Mali yıl için yıl sonu dönemini getirir
    /// </summary>
    Task<AccountingPeriod?> GetYearEndPeriodAsync(int fiscalYear, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get next period number for fiscal year
    /// Mali yıl için sonraki dönem numarasını getirir
    /// </summary>
    Task<int> GetNextPeriodNumberAsync(int fiscalYear, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get period by fiscal year, period number and type
    /// Mali yıl, dönem numarası ve türe göre dönem getirir
    /// </summary>
    Task<AccountingPeriod?> GetByFiscalYearAndPeriodNumberAsync(int fiscalYear, int periodNumber, AccountingPeriodType periodType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get active period
    /// Aktif dönemi getirir
    /// </summary>
    Task<AccountingPeriod?> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get period by date
    /// Tarihe göre dönem getirir
    /// </summary>
    Task<AccountingPeriod?> GetByDateAsync(DateTime date, CancellationToken cancellationToken = default);
}

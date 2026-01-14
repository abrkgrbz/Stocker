using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for TaxDeclaration entity
/// Vergi Beyannameleri - KDV, Muhtasar, Geçici Vergi vb.
/// </summary>
public interface ITaxDeclarationRepository : IFinanceRepository<TaxDeclaration>
{
    /// <summary>
    /// Get declaration with details and payments
    /// </summary>
    Task<TaxDeclaration?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get declaration by declaration number
    /// </summary>
    Task<TaxDeclaration?> GetByDeclarationNumberAsync(string declarationNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get next declaration number
    /// </summary>
    Task<string> GetNextDeclarationNumberAsync(TaxDeclarationType declarationType, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get declarations by type
    /// </summary>
    Task<IReadOnlyList<TaxDeclaration>> GetByTypeAsync(TaxDeclarationType declarationType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get declarations by period (year/month)
    /// </summary>
    Task<IReadOnlyList<TaxDeclaration>> GetByPeriodAsync(int year, int? month = null, int? quarter = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get declarations by year
    /// </summary>
    Task<IReadOnlyList<TaxDeclaration>> GetByYearAsync(int year, TaxDeclarationType? declarationType = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get declarations by status
    /// </summary>
    Task<IReadOnlyList<TaxDeclaration>> GetByStatusAsync(TaxDeclarationStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get overdue declarations (filing deadline passed)
    /// </summary>
    Task<IReadOnlyList<TaxDeclaration>> GetOverdueDeclarationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get declarations with unpaid balance
    /// </summary>
    Task<IReadOnlyList<TaxDeclaration>> GetUnpaidDeclarationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get declarations pending approval
    /// </summary>
    Task<IReadOnlyList<TaxDeclaration>> GetPendingApprovalAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get amendments for a declaration
    /// </summary>
    Task<IReadOnlyList<TaxDeclaration>> GetAmendmentsAsync(int originalDeclarationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if declaration exists for period
    /// </summary>
    Task<bool> ExistsForPeriodAsync(TaxDeclarationType declarationType, int year, int? month, int? quarter, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get declarations with upcoming deadlines
    /// </summary>
    Task<IReadOnlyList<TaxDeclaration>> GetUpcomingDeadlinesAsync(int daysAhead = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get declaration statistics for a year
    /// </summary>
    Task<(int TotalDeclarations, int DraftCount, int FiledCount, int PaidCount, decimal TotalTax, decimal TotalPaid)>
        GetYearlyStatsAsync(int year, CancellationToken cancellationToken = default);
}

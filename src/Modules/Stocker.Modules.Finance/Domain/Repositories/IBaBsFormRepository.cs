using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for BaBsForm entity
/// Ba-Bs Formu - 5.000 TL ve üzeri mal/hizmet alım-satım bildirimi
/// </summary>
public interface IBaBsFormRepository : IFinanceRepository<BaBsForm>
{
    /// <summary>
    /// Get form with items
    /// </summary>
    Task<BaBsForm?> GetWithItemsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get form by form number
    /// </summary>
    Task<BaBsForm?> GetByFormNumberAsync(string formNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get next form number
    /// </summary>
    Task<string> GetNextFormNumberAsync(BaBsFormType formType, int year, int month, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get forms by period
    /// </summary>
    Task<IReadOnlyList<BaBsForm>> GetByPeriodAsync(int year, int month, BaBsFormType? formType = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get forms by year
    /// </summary>
    Task<IReadOnlyList<BaBsForm>> GetByYearAsync(int year, BaBsFormType? formType = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get forms by status
    /// </summary>
    Task<IReadOnlyList<BaBsForm>> GetByStatusAsync(BaBsFormStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get overdue forms (filing deadline passed but not filed)
    /// </summary>
    Task<IReadOnlyList<BaBsForm>> GetOverdueFormsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get forms pending approval
    /// </summary>
    Task<IReadOnlyList<BaBsForm>> GetPendingApprovalAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get corrections for a form
    /// </summary>
    Task<IReadOnlyList<BaBsForm>> GetCorrectionsAsync(int originalFormId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if form exists for period
    /// </summary>
    Task<bool> ExistsForPeriodAsync(BaBsFormType formType, int year, int month, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get forms by tax ID
    /// </summary>
    Task<IReadOnlyList<BaBsForm>> GetByTaxIdAsync(string taxId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get draft forms
    /// </summary>
    Task<IReadOnlyList<BaBsForm>> GetDraftFormsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get form statistics for a year
    /// </summary>
    Task<(int TotalForms, int DraftForms, int FiledForms, int AcceptedForms, decimal TotalBaAmount, decimal TotalBsAmount)>
        GetYearlyStatsAsync(int year, CancellationToken cancellationToken = default);
}

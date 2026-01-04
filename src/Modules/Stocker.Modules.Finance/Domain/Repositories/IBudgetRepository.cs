using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for Budget entity
/// </summary>
public interface IBudgetRepository : IFinanceRepository<Budget>
{
    /// <summary>
    /// Get budget with child budgets
    /// </summary>
    Task<Budget?> GetWithChildrenAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budget with items
    /// </summary>
    Task<Budget?> GetWithItemsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budget by code
    /// </summary>
    Task<Budget?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budgets by fiscal year
    /// </summary>
    Task<IReadOnlyList<Budget>> GetByFiscalYearAsync(int fiscalYear, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budgets by type
    /// </summary>
    Task<IReadOnlyList<Budget>> GetByTypeAsync(BudgetType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budgets by category
    /// </summary>
    Task<IReadOnlyList<Budget>> GetByCategoryAsync(BudgetCategory category, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budgets by status
    /// </summary>
    Task<IReadOnlyList<Budget>> GetByStatusAsync(BudgetStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budgets by cost center
    /// </summary>
    Task<IReadOnlyList<Budget>> GetByCostCenterAsync(int costCenterId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budgets by department
    /// </summary>
    Task<IReadOnlyList<Budget>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budgets by project
    /// </summary>
    Task<IReadOnlyList<Budget>> GetByProjectAsync(int projectId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budgets by owner
    /// </summary>
    Task<IReadOnlyList<Budget>> GetByOwnerAsync(int ownerUserId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get child budgets of a parent
    /// </summary>
    Task<IReadOnlyList<Budget>> GetChildBudgetsAsync(int parentBudgetId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get active budgets for period
    /// </summary>
    Task<IReadOnlyList<Budget>> GetActiveBudgetsForPeriodAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get budgets at warning or critical level
    /// </summary>
    Task<IReadOnlyList<Budget>> GetBudgetsAtRiskAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if budget code exists
    /// </summary>
    Task<bool> CodeExistsAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);
}

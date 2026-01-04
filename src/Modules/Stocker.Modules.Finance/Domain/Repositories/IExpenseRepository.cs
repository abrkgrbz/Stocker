using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for Expense entity
/// </summary>
public interface IExpenseRepository : IFinanceRepository<Expense>
{
    /// <summary>
    /// Get expense by expense number
    /// </summary>
    Task<Expense?> GetByExpenseNumberAsync(string expenseNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get next expense number
    /// </summary>
    Task<string> GetNextExpenseNumberAsync(int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get expenses by category
    /// </summary>
    Task<IReadOnlyList<Expense>> GetByCategoryAsync(ExpenseMainCategory category, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get expenses by status
    /// </summary>
    Task<IReadOnlyList<Expense>> GetByStatusAsync(ExpenseStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get expenses by cost center
    /// </summary>
    Task<IReadOnlyList<Expense>> GetByCostCenterAsync(int costCenterId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get expenses by project
    /// </summary>
    Task<IReadOnlyList<Expense>> GetByProjectAsync(int projectId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get expenses by date range
    /// </summary>
    Task<IReadOnlyList<Expense>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get unpaid expenses
    /// </summary>
    Task<IReadOnlyList<Expense>> GetUnpaidExpensesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get pending approval expenses
    /// </summary>
    Task<IReadOnlyList<Expense>> GetPendingApprovalAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get total expenses by category for a date range
    /// </summary>
    Task<Dictionary<ExpenseMainCategory, decimal>> GetTotalByCategoryAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}

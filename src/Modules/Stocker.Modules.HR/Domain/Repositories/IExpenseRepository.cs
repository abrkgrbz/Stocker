using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Expense entity
/// </summary>
public interface IExpenseRepository : IHRRepository<Expense>
{
    /// <summary>
    /// Gets an expense by number
    /// </summary>
    Task<Expense?> GetByNumberAsync(string expenseNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expenses by employee
    /// </summary>
    Task<IReadOnlyList<Expense>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expenses by employee and date range
    /// </summary>
    Task<IReadOnlyList<Expense>> GetByEmployeeAndDateRangeAsync(int employeeId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expenses by status
    /// </summary>
    Task<IReadOnlyList<Expense>> GetByStatusAsync(ExpenseStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expenses pending approval
    /// </summary>
    Task<IReadOnlyList<Expense>> GetPendingApprovalAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expenses by type
    /// </summary>
    Task<IReadOnlyList<Expense>> GetByTypeAsync(ExpenseType expenseType, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets approved expenses not yet paid
    /// </summary>
    Task<IReadOnlyList<Expense>> GetApprovedUnpaidAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expense summary for an employee
    /// </summary>
    Task<(int Count, decimal TotalAmount, decimal ApprovedAmount, decimal PaidAmount)> GetEmployeeSummaryAsync(int employeeId, int year, int? month = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if expense number exists
    /// </summary>
    Task<bool> ExistsWithNumberAsync(string expenseNumber, int? excludeExpenseId = null, CancellationToken cancellationToken = default);
}

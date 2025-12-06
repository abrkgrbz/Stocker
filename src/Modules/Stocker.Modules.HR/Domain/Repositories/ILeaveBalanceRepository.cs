using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for LeaveBalance entity
/// </summary>
public interface ILeaveBalanceRepository : IHRRepository<LeaveBalance>
{
    /// <summary>
    /// Gets leave balance for an employee and leave type for a specific year
    /// </summary>
    Task<LeaveBalance?> GetByEmployeeLeaveTypeAndYearAsync(int employeeId, int leaveTypeId, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all leave balances for an employee for a specific year
    /// </summary>
    Task<IReadOnlyList<LeaveBalance>> GetByEmployeeAndYearAsync(int employeeId, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all leave balances for a specific year
    /// </summary>
    Task<IReadOnlyList<LeaveBalance>> GetByYearAsync(int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leave balances for a department
    /// </summary>
    Task<IReadOnlyList<LeaveBalance>> GetByDepartmentAndYearAsync(int departmentId, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates leave balances for a new year based on leave types
    /// </summary>
    Task CreateYearlyBalancesAsync(int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes carry forward for a specific year
    /// </summary>
    Task ProcessCarryForwardAsync(int fromYear, int toYear, CancellationToken cancellationToken = default);
}

using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for TimeSheet entity
/// </summary>
public interface ITimeSheetRepository : IHRRepository<TimeSheet>
{
    /// <summary>
    /// Gets a timesheet by ID with all related data
    /// </summary>
    System.Threading.Tasks.Task<TimeSheet?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all timesheets with optional filters and pagination
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetAllAsync(
        int? employeeId = null,
        TimeSheetStatus? status = null,
        DateOnly? periodStartFrom = null,
        DateOnly? periodStartTo = null,
        bool? isLocked = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets timesheets by employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets timesheets by status
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetByStatusAsync(TimeSheetStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets timesheets by period
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetByPeriodAsync(DateOnly periodStart, DateOnly periodEnd, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a timesheet by employee and period
    /// </summary>
    System.Threading.Tasks.Task<TimeSheet?> GetByEmployeeAndPeriodAsync(int employeeId, DateOnly periodStart, DateOnly periodEnd, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending timesheets for approval
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetPendingApprovalsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets locked timesheets
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetLockedAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new timesheet
    /// </summary>
    System.Threading.Tasks.Task<TimeSheet> CreateAsync(TimeSheet timeSheet, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing timesheet
    /// </summary>
    System.Threading.Tasks.Task<TimeSheet> UpdateAsync(TimeSheet timeSheet, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a timesheet
    /// </summary>
    System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}

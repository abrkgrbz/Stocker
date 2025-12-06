using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Leave entity
/// </summary>
public interface ILeaveRepository : IHRRepository<Leave>
{
    /// <summary>
    /// Gets a leave with employee and leave type details
    /// </summary>
    Task<Leave?> GetWithDetailsAsync(int leaveId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leaves by employee
    /// </summary>
    Task<IReadOnlyList<Leave>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leaves by employee and year
    /// </summary>
    Task<IReadOnlyList<Leave>> GetByEmployeeAndYearAsync(int employeeId, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leaves by status
    /// </summary>
    Task<IReadOnlyList<Leave>> GetByStatusAsync(LeaveStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending leaves for approval
    /// </summary>
    Task<IReadOnlyList<Leave>> GetPendingForApprovalAsync(int? approverId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leaves in a date range
    /// </summary>
    Task<IReadOnlyList<Leave>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leaves by department in a date range
    /// </summary>
    Task<IReadOnlyList<Leave>> GetByDepartmentAndDateRangeAsync(int departmentId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active leaves for today
    /// </summary>
    Task<IReadOnlyList<Leave>> GetActiveTodayAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets upcoming leaves
    /// </summary>
    Task<IReadOnlyList<Leave>> GetUpcomingAsync(int days = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if employee has overlapping leaves
    /// </summary>
    Task<bool> HasOverlappingLeaveAsync(int employeeId, DateTime startDate, DateTime endDate, int? excludeLeaveId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets total leave days used by an employee for a leave type in a year
    /// </summary>
    Task<decimal> GetUsedDaysAsync(int employeeId, int leaveTypeId, int year, CancellationToken cancellationToken = default);
}

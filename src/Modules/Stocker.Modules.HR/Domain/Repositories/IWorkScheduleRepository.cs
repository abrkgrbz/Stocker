using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for WorkSchedule entity
/// </summary>
public interface IWorkScheduleRepository : IHRRepository<WorkSchedule>
{
    /// <summary>
    /// Gets work schedules by employee
    /// </summary>
    Task<IReadOnlyList<WorkSchedule>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active work schedule for an employee
    /// </summary>
    Task<WorkSchedule?> GetActiveByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets work schedules by shift
    /// </summary>
    Task<IReadOnlyList<WorkSchedule>> GetByShiftAsync(int shiftId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets work schedules by date range
    /// </summary>
    Task<IReadOnlyList<WorkSchedule>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active schedules for a specific date
    /// </summary>
    Task<IReadOnlyList<WorkSchedule>> GetActiveForDateAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if employee has overlapping schedule
    /// </summary>
    Task<bool> HasOverlappingScheduleAsync(int employeeId, DateTime startDate, DateTime? endDate, int? excludeScheduleId = null, CancellationToken cancellationToken = default);
}

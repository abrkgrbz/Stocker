using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Attendance entity
/// </summary>
public interface IAttendanceRepository : IHRRepository<Attendance>
{
    /// <summary>
    /// Gets attendance record for an employee on a specific date
    /// </summary>
    Task<Attendance?> GetByEmployeeAndDateAsync(int employeeId, DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets attendance records for an employee in a date range
    /// </summary>
    Task<IReadOnlyList<Attendance>> GetByEmployeeAndDateRangeAsync(int employeeId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets attendance records for a specific date
    /// </summary>
    Task<IReadOnlyList<Attendance>> GetByDateAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets attendance records by status
    /// </summary>
    Task<IReadOnlyList<Attendance>> GetByStatusAsync(AttendanceStatus status, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets late arrivals for a date range
    /// </summary>
    Task<IReadOnlyList<Attendance>> GetLateArrivalsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets early departures for a date range
    /// </summary>
    Task<IReadOnlyList<Attendance>> GetEarlyDeparturesAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets attendance records with overtime
    /// </summary>
    Task<IReadOnlyList<Attendance>> GetWithOvertimeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets attendance records by department for a date
    /// </summary>
    Task<IReadOnlyList<Attendance>> GetByDepartmentAndDateAsync(int departmentId, DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets today's check-in status for an employee
    /// </summary>
    Task<Attendance?> GetTodayAttendanceAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets attendance summary for an employee in a month
    /// </summary>
    Task<(int Present, int Absent, int Late, int OnLeave, decimal TotalWorkedHours, decimal TotalOvertimeHours)> GetMonthlySummaryAsync(int employeeId, int year, int month, CancellationToken cancellationToken = default);
}

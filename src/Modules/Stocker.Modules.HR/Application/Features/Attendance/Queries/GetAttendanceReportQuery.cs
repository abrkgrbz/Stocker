using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Attendance.Queries;

/// <summary>
/// Query to get attendance report for a period
/// </summary>
public class GetAttendanceReportQuery : IRequest<Result<List<AttendanceSummaryDto>>>
{
    public Guid TenantId { get; set; }
    public int? EmployeeId { get; set; }
    public int? DepartmentId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
}

/// <summary>
/// Handler for GetAttendanceReportQuery
/// </summary>
public class GetAttendanceReportQueryHandler : IRequestHandler<GetAttendanceReportQuery, Result<List<AttendanceSummaryDto>>>
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IDepartmentRepository _departmentRepository;

    public GetAttendanceReportQueryHandler(
        IAttendanceRepository attendanceRepository,
        IEmployeeRepository employeeRepository,
        IDepartmentRepository departmentRepository)
    {
        _attendanceRepository = attendanceRepository;
        _employeeRepository = employeeRepository;
        _departmentRepository = departmentRepository;
    }

    public async Task<Result<List<AttendanceSummaryDto>>> Handle(GetAttendanceReportQuery request, CancellationToken cancellationToken)
    {
        // Validate year and month
        if (request.Year < 2000 || request.Year > 2100)
        {
            return Result<List<AttendanceSummaryDto>>.Failure(
                Error.Validation("Year", "Year must be between 2000 and 2100"));
        }

        if (request.Month < 1 || request.Month > 12)
        {
            return Result<List<AttendanceSummaryDto>>.Failure(
                Error.Validation("Month", "Month must be between 1 and 12"));
        }

        // Get employees to report on
        IReadOnlyList<Domain.Entities.Employee> employees;

        if (request.EmployeeId.HasValue)
        {
            var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId.Value, cancellationToken);
            if (employee == null)
            {
                return Result<List<AttendanceSummaryDto>>.Failure(
                    Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
            }
            employees = new List<Domain.Entities.Employee> { employee };
        }
        else if (request.DepartmentId.HasValue)
        {
            var department = await _departmentRepository.GetByIdAsync(request.DepartmentId.Value, cancellationToken);
            if (department == null)
            {
                return Result<List<AttendanceSummaryDto>>.Failure(
                    Error.NotFound("Department", $"Department with ID {request.DepartmentId} not found"));
            }
            employees = await _employeeRepository.GetByDepartmentAsync(request.DepartmentId.Value, cancellationToken);
        }
        else
        {
            employees = await _employeeRepository.GetActiveEmployeesAsync(cancellationToken);
        }

        // Generate summaries
        var summaries = new List<AttendanceSummaryDto>();

        foreach (var employee in employees)
        {
            // Get monthly summary from repository
            var summary = await _attendanceRepository.GetMonthlySummaryAsync(
                employee.Id,
                request.Year,
                request.Month,
                cancellationToken);

            // Calculate total work days in month (excluding weekends)
            var daysInMonth = DateTime.DaysInMonth(request.Year, request.Month);
            var totalWorkDays = 0;

            for (int day = 1; day <= daysInMonth; day++)
            {
                var date = new DateTime(request.Year, request.Month, day);
                if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                {
                    totalWorkDays++;
                }
            }

            // Get additional statistics from attendance records
            var startDate = new DateTime(request.Year, request.Month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            var attendances = await _attendanceRepository.GetByEmployeeAndDateRangeAsync(
                employee.Id,
                startDate,
                endDate,
                cancellationToken);

            var earlyDepartureDays = attendances.Count(a => a.Status == AttendanceStatus.EarlyDeparture);
            var leaveDays = attendances.Count(a => a.Status == AttendanceStatus.OnLeave);
            var holidayDays = attendances.Count(a => a.Status == AttendanceStatus.Holiday);

            // Calculate total late minutes
            var totalLateMinutes = attendances
                .Where(a => a.LateMinutes.HasValue)
                .Sum(a => (decimal)a.LateMinutes.Value.TotalMinutes);

            summaries.Add(new AttendanceSummaryDto
            {
                EmployeeId = employee.Id,
                EmployeeName = $"{employee.FirstName} {employee.LastName}",
                Month = request.Month,
                Year = request.Year,
                TotalWorkDays = totalWorkDays,
                PresentDays = summary.Present,
                AbsentDays = summary.Absent,
                LateDays = summary.Late,
                EarlyDepartureDays = earlyDepartureDays,
                LeaveDays = leaveDays,
                HolidayDays = holidayDays,
                TotalWorkedHours = summary.TotalWorkedHours,
                TotalOvertimeHours = summary.TotalOvertimeHours,
                TotalLateMinutes = totalLateMinutes
            });
        }

        return Result<List<AttendanceSummaryDto>>.Success(
            summaries.OrderBy(s => s.EmployeeName).ToList());
    }
}

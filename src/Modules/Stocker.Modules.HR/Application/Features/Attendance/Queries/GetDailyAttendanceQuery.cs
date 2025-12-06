using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Attendance.Queries;

/// <summary>
/// Query to get daily attendance summary
/// </summary>
public class GetDailyAttendanceQuery : IRequest<Result<DailyAttendanceReportDto>>
{
    public Guid TenantId { get; set; }
    public DateTime Date { get; set; }
    public int? DepartmentId { get; set; }
}

/// <summary>
/// Handler for GetDailyAttendanceQuery
/// </summary>
public class GetDailyAttendanceQueryHandler : IRequestHandler<GetDailyAttendanceQuery, Result<DailyAttendanceReportDto>>
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IShiftRepository _shiftRepository;

    public GetDailyAttendanceQueryHandler(
        IAttendanceRepository attendanceRepository,
        IEmployeeRepository employeeRepository,
        IShiftRepository shiftRepository)
    {
        _attendanceRepository = attendanceRepository;
        _employeeRepository = employeeRepository;
        _shiftRepository = shiftRepository;
    }

    public async Task<Result<DailyAttendanceReportDto>> Handle(GetDailyAttendanceQuery request, CancellationToken cancellationToken)
    {
        var date = request.Date.Date;

        // Get attendance records for the day
        IReadOnlyList<Domain.Entities.Attendance> attendances;

        if (request.DepartmentId.HasValue)
        {
            attendances = await _attendanceRepository.GetByDepartmentAndDateAsync(
                request.DepartmentId.Value,
                date,
                cancellationToken);
        }
        else
        {
            attendances = await _attendanceRepository.GetByDateAsync(date, cancellationToken);
        }

        // Get all active employees for total count
        var allEmployees = await _employeeRepository.GetActiveEmployeesAsync(cancellationToken);

        // Filter by department if specified
        if (request.DepartmentId.HasValue)
        {
            allEmployees = allEmployees.Where(e => e.DepartmentId == request.DepartmentId.Value).ToList();
        }

        var totalEmployees = allEmployees.Count;

        // Calculate statistics
        var present = attendances.Count(a => a.Status == AttendanceStatus.Present ||
                                            a.Status == AttendanceStatus.Late ||
                                            a.Status == AttendanceStatus.EarlyDeparture ||
                                            a.Status == AttendanceStatus.RemoteWork ||
                                            a.Status == AttendanceStatus.FieldWork ||
                                            a.Status == AttendanceStatus.Training);

        var absent = attendances.Count(a => a.Status == AttendanceStatus.Absent);
        var late = attendances.Count(a => a.Status == AttendanceStatus.Late);
        var onLeave = attendances.Count(a => a.Status == AttendanceStatus.OnLeave);
        var holiday = attendances.Count(a => a.Status == AttendanceStatus.Holiday);

        // Map attendances to DTOs
        var attendanceDtos = new List<AttendanceDto>();
        foreach (var attendance in attendances)
        {
            var employee = await _employeeRepository.GetByIdAsync(attendance.EmployeeId, cancellationToken);
            if (employee == null) continue;

            string? shiftName = null;
            if (attendance.ShiftId.HasValue)
            {
                var shift = await _shiftRepository.GetByIdAsync(attendance.ShiftId.Value, cancellationToken);
                shiftName = shift?.Name;
            }

            var checkInDateTime = attendance.CheckInTime.HasValue
                ? attendance.Date.Add(attendance.CheckInTime.Value)
                : (DateTime?)null;

            var checkOutDateTime = attendance.CheckOutTime.HasValue
                ? attendance.Date.Add(attendance.CheckOutTime.Value)
                : (DateTime?)null;

            attendanceDtos.Add(new AttendanceDto
            {
                Id = attendance.Id,
                EmployeeId = attendance.EmployeeId,
                EmployeeName = $"{employee.FirstName} {employee.LastName}",
                EmployeeCode = employee.EmployeeCode,
                Date = attendance.Date,
                CheckInTime = checkInDateTime,
                CheckOutTime = checkOutDateTime,
                WorkedHours = attendance.WorkHours.HasValue ? (decimal)attendance.WorkHours.Value.TotalHours : null,
                OvertimeHours = attendance.OvertimeHours.HasValue ? (decimal)attendance.OvertimeHours.Value.TotalHours : null,
                LateMinutes = attendance.LateMinutes.HasValue ? (decimal)attendance.LateMinutes.Value.TotalMinutes : null,
                EarlyDepartureMinutes = attendance.EarlyDepartureMinutes.HasValue ? (decimal)attendance.EarlyDepartureMinutes.Value.TotalMinutes : null,
                Status = attendance.Status,
                ShiftId = attendance.ShiftId,
                ShiftName = shiftName,
                CheckInLatitude = attendance.CheckInLatitude,
                CheckInLongitude = attendance.CheckInLongitude,
                CheckOutLatitude = attendance.CheckOutLatitude,
                CheckOutLongitude = attendance.CheckOutLongitude,
                IsManualEntry = attendance.IsManualEntry,
                Notes = attendance.Notes,
                CreatedAt = attendance.CreatedDate
            });
        }

        var report = new DailyAttendanceReportDto
        {
            Date = date,
            TotalEmployees = totalEmployees,
            Present = present,
            Absent = absent,
            Late = late,
            OnLeave = onLeave,
            Holiday = holiday,
            Attendances = attendanceDtos.OrderBy(a => a.EmployeeName).ToList()
        };

        return Result<DailyAttendanceReportDto>.Success(report);
    }
}

using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Attendance.Queries;

/// <summary>
/// Query to get daily attendance summary
/// </summary>
public record GetDailyAttendanceQuery : IRequest<Result<DailyAttendanceReportDto>>
{
    public DateTime Date { get; init; }
    public int? DepartmentId { get; init; }
}

/// <summary>
/// Handler for GetDailyAttendanceQuery
/// </summary>
public class GetDailyAttendanceQueryHandler : IRequestHandler<GetDailyAttendanceQuery, Result<DailyAttendanceReportDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetDailyAttendanceQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<DailyAttendanceReportDto>> Handle(GetDailyAttendanceQuery request, CancellationToken cancellationToken)
    {
        var date = request.Date.Date;

        // Get attendance records for the day
        IReadOnlyList<Domain.Entities.Attendance> attendances;

        if (request.DepartmentId.HasValue)
        {
            attendances = await _unitOfWork.Attendances.GetByDepartmentAndDateAsync(
                request.DepartmentId.Value,
                date,
                cancellationToken);
        }
        else
        {
            attendances = await _unitOfWork.Attendances.GetByDateAsync(date, cancellationToken);
        }

        // Get all active employees for total count
        var allEmployees = await _unitOfWork.Employees.GetActiveEmployeesAsync(cancellationToken);

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
            var employee = await _unitOfWork.Employees.GetByIdAsync(attendance.EmployeeId, cancellationToken);
            if (employee == null) continue;

            string? shiftName = null;
            if (attendance.ShiftId.HasValue)
            {
                var shift = await _unitOfWork.Shifts.GetByIdAsync(attendance.ShiftId.Value, cancellationToken);
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

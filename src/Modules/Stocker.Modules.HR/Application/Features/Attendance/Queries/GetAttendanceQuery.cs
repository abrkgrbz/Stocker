using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Attendance.Queries;

/// <summary>
/// Query to get attendance records with filtering
/// </summary>
public record GetAttendanceQuery : IRequest<Result<List<AttendanceDto>>>
{
    public int? EmployeeId { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public AttendanceStatus? Status { get; init; }
    public int? DepartmentId { get; init; }
    public bool? IsManualEntry { get; init; }
    public bool IncludeLateOnly { get; init; } = false;
    public bool IncludeOvertimeOnly { get; init; } = false;
}

/// <summary>
/// Handler for GetAttendanceQuery
/// </summary>
public class GetAttendanceQueryHandler : IRequestHandler<GetAttendanceQuery, Result<List<AttendanceDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetAttendanceQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<AttendanceDto>>> Handle(GetAttendanceQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Attendance> attendances;

        var startDate = request.StartDate ?? DateTime.UtcNow.Date.AddDays(-30);
        var endDate = request.EndDate ?? DateTime.UtcNow.Date;

        // Apply primary filter
        if (request.EmployeeId.HasValue)
        {
            attendances = await _unitOfWork.Attendances.GetByEmployeeAndDateRangeAsync(
                request.EmployeeId.Value,
                startDate,
                endDate,
                cancellationToken);
        }
        else if (request.Status.HasValue)
        {
            attendances = await _unitOfWork.Attendances.GetByStatusAsync(
                request.Status.Value,
                startDate,
                endDate,
                cancellationToken);
        }
        else if (request.IncludeLateOnly)
        {
            attendances = await _unitOfWork.Attendances.GetLateArrivalsAsync(
                startDate,
                endDate,
                cancellationToken);
        }
        else if (request.IncludeOvertimeOnly)
        {
            attendances = await _unitOfWork.Attendances.GetWithOvertimeAsync(
                startDate,
                endDate,
                cancellationToken);
        }
        else if (request.DepartmentId.HasValue)
        {
            // Get all dates in range for department
            var allAttendances = new List<Domain.Entities.Attendance>();
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                var dailyAttendances = await _unitOfWork.Attendances.GetByDepartmentAndDateAsync(
                    request.DepartmentId.Value,
                    date,
                    cancellationToken);
                allAttendances.AddRange(dailyAttendances);
            }
            attendances = allAttendances;
        }
        else
        {
            // Get all attendance records - this would need a new repository method
            // For now, we'll return empty if no specific filter is provided
            attendances = new List<Domain.Entities.Attendance>();
        }

        // Apply additional filters
        var filteredAttendances = attendances.AsEnumerable();

        if (request.IsManualEntry.HasValue)
        {
            filteredAttendances = filteredAttendances.Where(a => a.IsManualEntry == request.IsManualEntry.Value);
        }

        // Map to DTOs
        var attendanceDtos = new List<AttendanceDto>();
        foreach (var attendance in filteredAttendances)
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

        return Result<List<AttendanceDto>>.Success(attendanceDtos.OrderByDescending(a => a.Date).ToList());
    }
}

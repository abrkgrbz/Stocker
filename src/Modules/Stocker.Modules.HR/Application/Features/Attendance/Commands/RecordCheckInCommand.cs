using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Attendance.Commands;

/// <summary>
/// Command to record employee check-in
/// </summary>
public record RecordCheckInCommand : IRequest<Result<AttendanceDto>>
{
    public int EmployeeId { get; init; }
    public decimal? Latitude { get; init; }
    public decimal? Longitude { get; init; }
    public string? Location { get; init; }
    public string? IpAddress { get; init; }
    public string? DeviceInfo { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// Validator for RecordCheckInCommand
/// </summary>
public class RecordCheckInCommandValidator : AbstractValidator<RecordCheckInCommand>
{
    public RecordCheckInCommandValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID is required");

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90")
            .When(x => x.Latitude.HasValue);

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180")
            .When(x => x.Longitude.HasValue);
    }
}

/// <summary>
/// Handler for RecordCheckInCommand
/// </summary>
public class RecordCheckInCommandHandler : IRequestHandler<RecordCheckInCommand, Result<AttendanceDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public RecordCheckInCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AttendanceDto>> Handle(RecordCheckInCommand request, CancellationToken cancellationToken)
    {
        // Validate employee exists
        var employee = await _unitOfWork.Employees.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<AttendanceDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        var today = DateTime.UtcNow.Date;
        var currentTime = DateTime.UtcNow.TimeOfDay;

        // Check if attendance record exists for today
        var attendance = await _unitOfWork.Attendances.GetByEmployeeAndDateAsync(request.EmployeeId, today, cancellationToken);

        if (attendance == null)
        {
            // Create new attendance record
            attendance = new Domain.Entities.Attendance(request.EmployeeId, today, employee.ShiftId);
            attendance.SetTenantId(_unitOfWork.TenantId);
        }
        else
        {
            // Check if already checked in
            if (attendance.CheckInTime.HasValue)
            {
                return Result<AttendanceDto>.Failure(
                    Error.Validation("Attendance.CheckIn", "Employee has already checked in today"));
            }
        }

        // Get shift information for expected check-in time
        TimeSpan? expectedCheckIn = null;
        string? shiftName = null;
        if (employee.ShiftId.HasValue)
        {
            var shift = await _unitOfWork.Shifts.GetByIdAsync(employee.ShiftId.Value, cancellationToken);
            if (shift != null)
            {
                expectedCheckIn = shift.StartTime;
                shiftName = shift.Name;
            }
        }

        // Record check-in
        attendance.CheckIn(
            currentTime,
            expectedCheckIn,
            request.Location,
            request.Latitude,
            request.Longitude,
            request.IpAddress,
            request.DeviceInfo);

        if (!string.IsNullOrEmpty(request.Notes))
        {
            attendance.SetNotes(request.Notes);
        }

        // Save changes
        if (attendance.Id == 0)
        {
            await _unitOfWork.Attendances.AddAsync(attendance, cancellationToken);
        }
        else
        {
            await _unitOfWork.Attendances.UpdateAsync(attendance, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var checkInDateTime = attendance.CheckInTime.HasValue
            ? attendance.Date.Add(attendance.CheckInTime.Value)
            : (DateTime?)null;

        var attendanceDto = new AttendanceDto
        {
            Id = attendance.Id,
            EmployeeId = attendance.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            EmployeeCode = employee.EmployeeCode,
            Date = attendance.Date,
            CheckInTime = checkInDateTime,
            WorkedHours = attendance.WorkHours.HasValue ? (decimal)attendance.WorkHours.Value.TotalHours : null,
            OvertimeHours = attendance.OvertimeHours.HasValue ? (decimal)attendance.OvertimeHours.Value.TotalHours : null,
            LateMinutes = attendance.LateMinutes.HasValue ? (decimal)attendance.LateMinutes.Value.TotalMinutes : null,
            Status = attendance.Status,
            ShiftId = attendance.ShiftId,
            ShiftName = shiftName,
            CheckInLatitude = attendance.CheckInLatitude,
            CheckInLongitude = attendance.CheckInLongitude,
            IsManualEntry = attendance.IsManualEntry,
            Notes = attendance.Notes,
            CreatedAt = attendance.CreatedDate
        };

        return Result<AttendanceDto>.Success(attendanceDto);
    }
}

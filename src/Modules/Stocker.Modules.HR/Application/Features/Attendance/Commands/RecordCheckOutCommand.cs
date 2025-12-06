using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Attendance.Commands;

/// <summary>
/// Command to record employee check-out
/// </summary>
public class RecordCheckOutCommand : IRequest<Result<AttendanceDto>>
{
    public Guid TenantId { get; set; }
    public int EmployeeId { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Location { get; set; }
    public string? IpAddress { get; set; }
    public string? DeviceInfo { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Validator for RecordCheckOutCommand
/// </summary>
public class RecordCheckOutCommandValidator : AbstractValidator<RecordCheckOutCommand>
{
    public RecordCheckOutCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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
/// Handler for RecordCheckOutCommand
/// </summary>
public class RecordCheckOutCommandHandler : IRequestHandler<RecordCheckOutCommand, Result<AttendanceDto>>
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IShiftRepository _shiftRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RecordCheckOutCommandHandler(
        IAttendanceRepository attendanceRepository,
        IEmployeeRepository employeeRepository,
        IShiftRepository shiftRepository,
        IUnitOfWork unitOfWork)
    {
        _attendanceRepository = attendanceRepository;
        _employeeRepository = employeeRepository;
        _shiftRepository = shiftRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AttendanceDto>> Handle(RecordCheckOutCommand request, CancellationToken cancellationToken)
    {
        // Validate employee exists
        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<AttendanceDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        var today = DateTime.UtcNow.Date;
        var currentTime = DateTime.UtcNow.TimeOfDay;

        // Get today's attendance record
        var attendance = await _attendanceRepository.GetByEmployeeAndDateAsync(request.EmployeeId, today, cancellationToken);

        if (attendance == null)
        {
            return Result<AttendanceDto>.Failure(
                Error.NotFound("Attendance", "No check-in record found for today. Please check in first."));
        }

        // Validate check-in exists
        if (!attendance.CheckInTime.HasValue)
        {
            return Result<AttendanceDto>.Failure(
                Error.Validation("Attendance.CheckOut", "Cannot check out without checking in first"));
        }

        // Check if already checked out
        if (attendance.CheckOutTime.HasValue)
        {
            return Result<AttendanceDto>.Failure(
                Error.Validation("Attendance.CheckOut", "Employee has already checked out today"));
        }

        // Get shift information for expected check-out time
        TimeSpan? expectedCheckOut = null;
        string? shiftName = null;
        if (employee.ShiftId.HasValue)
        {
            var shift = await _shiftRepository.GetByIdAsync(employee.ShiftId.Value, cancellationToken);
            if (shift != null)
            {
                expectedCheckOut = shift.EndTime;
                shiftName = shift.Name;
            }
        }

        // Record check-out
        attendance.CheckOut(
            currentTime,
            expectedCheckOut,
            request.Location,
            request.Latitude,
            request.Longitude);

        if (!string.IsNullOrEmpty(request.Notes))
        {
            var existingNotes = attendance.Notes ?? string.Empty;
            attendance.SetNotes(string.IsNullOrEmpty(existingNotes)
                ? request.Notes
                : $"{existingNotes}; {request.Notes}");
        }

        // Update attendance
        await _attendanceRepository.UpdateAsync(attendance, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var checkInDateTime = attendance.CheckInTime.HasValue
            ? attendance.Date.Add(attendance.CheckInTime.Value)
            : (DateTime?)null;

        var checkOutDateTime = attendance.CheckOutTime.HasValue
            ? attendance.Date.Add(attendance.CheckOutTime.Value)
            : (DateTime?)null;

        var attendanceDto = new AttendanceDto
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
        };

        return Result<AttendanceDto>.Success(attendanceDto);
    }
}

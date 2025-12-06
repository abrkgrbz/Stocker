using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Attendance.Commands;

/// <summary>
/// Command to update/correct attendance record manually
/// </summary>
public class UpdateAttendanceCommand : IRequest<Result<AttendanceDto>>
{
    public Guid TenantId { get; set; }
    public int AttendanceId { get; set; }
    public TimeSpan? CheckInTime { get; set; }
    public TimeSpan? CheckOutTime { get; set; }
    public AttendanceStatus? Status { get; set; }
    public int? ShiftId { get; set; }
    public string? Notes { get; set; }
    public string CorrectionReason { get; set; } = string.Empty;
    public int? ApprovedById { get; set; }
}

/// <summary>
/// Validator for UpdateAttendanceCommand
/// </summary>
public class UpdateAttendanceCommandValidator : AbstractValidator<UpdateAttendanceCommand>
{
    public UpdateAttendanceCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.AttendanceId)
            .GreaterThan(0).WithMessage("Attendance ID is required");

        RuleFor(x => x.CorrectionReason)
            .NotEmpty().WithMessage("Correction reason is required for manual updates")
            .MaximumLength(500).WithMessage("Correction reason must not exceed 500 characters");

        RuleFor(x => x.CheckInTime)
            .LessThan(x => x.CheckOutTime)
            .WithMessage("Check-in time must be before check-out time")
            .When(x => x.CheckInTime.HasValue && x.CheckOutTime.HasValue);

        RuleFor(x => x.ApprovedById)
            .GreaterThan(0).WithMessage("Approved by ID must be valid")
            .When(x => x.ApprovedById.HasValue);
    }
}

/// <summary>
/// Handler for UpdateAttendanceCommand
/// </summary>
public class UpdateAttendanceCommandHandler : IRequestHandler<UpdateAttendanceCommand, Result<AttendanceDto>>
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IShiftRepository _shiftRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAttendanceCommandHandler(
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

    public async Task<Result<AttendanceDto>> Handle(UpdateAttendanceCommand request, CancellationToken cancellationToken)
    {
        // Get attendance record
        var attendance = await _attendanceRepository.GetByIdAsync(request.AttendanceId, cancellationToken);
        if (attendance == null)
        {
            return Result<AttendanceDto>.Failure(
                Error.NotFound("Attendance", $"Attendance record with ID {request.AttendanceId} not found"));
        }

        // Get employee for mapping
        var employee = await _employeeRepository.GetByIdAsync(attendance.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<AttendanceDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {attendance.EmployeeId} not found"));
        }

        // Validate approver if provided
        if (request.ApprovedById.HasValue)
        {
            var approver = await _employeeRepository.GetByIdAsync(request.ApprovedById.Value, cancellationToken);
            if (approver == null)
            {
                return Result<AttendanceDto>.Failure(
                    Error.NotFound("Approver", $"Approver with ID {request.ApprovedById} not found"));
            }
        }

        // Update check-in time if provided
        if (request.CheckInTime.HasValue)
        {
            attendance.CorrectCheckIn(request.CheckInTime.Value, request.CorrectionReason);
        }

        // Update check-out time if provided
        if (request.CheckOutTime.HasValue)
        {
            attendance.CorrectCheckOut(request.CheckOutTime.Value, request.CorrectionReason);
        }

        // Update shift if provided
        if (request.ShiftId.HasValue)
        {
            var shift = await _shiftRepository.GetByIdAsync(request.ShiftId.Value, cancellationToken);
            if (shift == null)
            {
                return Result<AttendanceDto>.Failure(
                    Error.NotFound("Shift", $"Shift with ID {request.ShiftId} not found"));
            }
            attendance.SetShift(request.ShiftId.Value);
        }

        // Update status if provided
        if (request.Status.HasValue)
        {
            switch (request.Status.Value)
            {
                case AttendanceStatus.OnLeave:
                    attendance.MarkAsLeave();
                    break;
                case AttendanceStatus.Holiday:
                    attendance.MarkAsHoliday();
                    break;
                case AttendanceStatus.Weekend:
                    attendance.MarkAsWeekend();
                    break;
                case AttendanceStatus.RemoteWork:
                    attendance.MarkAsRemoteWork();
                    break;
                case AttendanceStatus.Training:
                    attendance.MarkAsTraining(request.Notes);
                    break;
                case AttendanceStatus.FieldWork:
                    attendance.MarkAsFieldWork(request.Notes);
                    break;
            }
        }

        // Update notes if provided
        if (!string.IsNullOrEmpty(request.Notes))
        {
            var existingNotes = attendance.Notes ?? string.Empty;
            var correctionNote = $"Manual correction: {request.CorrectionReason}";
            var newNotes = string.IsNullOrEmpty(existingNotes)
                ? $"{request.Notes}; {correctionNote}"
                : $"{existingNotes}; {request.Notes}; {correctionNote}";
            attendance.SetNotes(newNotes);
        }

        // Mark as manual entry
        attendance.SetManualEntry(true);

        // Approve if approver is provided
        if (request.ApprovedById.HasValue)
        {
            attendance.Approve(request.ApprovedById.Value);
        }

        // Save changes
        await _attendanceRepository.UpdateAsync(attendance, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get shift name if applicable
        string? shiftName = null;
        if (attendance.ShiftId.HasValue)
        {
            var shift = await _shiftRepository.GetByIdAsync(attendance.ShiftId.Value, cancellationToken);
            shiftName = shift?.Name;
        }

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

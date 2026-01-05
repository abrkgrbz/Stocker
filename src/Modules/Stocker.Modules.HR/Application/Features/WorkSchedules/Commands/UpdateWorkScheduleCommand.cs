using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkSchedules.Commands;

/// <summary>
/// Command to update an existing work schedule
/// </summary>
public record UpdateWorkScheduleCommand : IRequest<Result<WorkScheduleDto>>
{
    public int ScheduleId { get; init; }
    public UpdateWorkScheduleDto ScheduleData { get; init; } = null!;
}

/// <summary>
/// Validator for UpdateWorkScheduleCommand
/// </summary>
public class UpdateWorkScheduleCommandValidator : AbstractValidator<UpdateWorkScheduleCommand>
{
    public UpdateWorkScheduleCommandValidator()
    {
        RuleFor(x => x.ScheduleId)
            .GreaterThan(0).WithMessage("Valid schedule ID is required");

        RuleFor(x => x.ScheduleData)
            .NotNull().WithMessage("Schedule data is required");

        When(x => x.ScheduleData != null, () =>
        {
            RuleFor(x => x.ScheduleData.ShiftId)
                .GreaterThan(0).WithMessage("Valid shift ID is required");

            RuleFor(x => x.ScheduleData.Notes)
                .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");
        });
    }
}

/// <summary>
/// Handler for UpdateWorkScheduleCommand
/// </summary>
public class UpdateWorkScheduleCommandHandler : IRequestHandler<UpdateWorkScheduleCommand, Result<WorkScheduleDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateWorkScheduleCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<WorkScheduleDto>> Handle(UpdateWorkScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _unitOfWork.WorkSchedules.GetByIdAsync(request.ScheduleId, cancellationToken);
        if (schedule == null)
        {
            return Result<WorkScheduleDto>.Failure(
                Error.NotFound("WorkSchedule.NotFound", $"Work schedule with ID {request.ScheduleId} not found"));
        }

        var data = request.ScheduleData;

        // Validate shift if changed
        if (schedule.ShiftId != data.ShiftId)
        {
            var shift = await _unitOfWork.Shifts.GetByIdAsync(data.ShiftId, cancellationToken);
            if (shift == null)
            {
                return Result<WorkScheduleDto>.Failure(
                    Error.NotFound("Shift.NotFound", $"Shift with ID {data.ShiftId} not found"));
            }
            schedule.ChangeShift(data.ShiftId);
        }

        if (data.IsWorkDay)
        {
            schedule.SetAsWorkDay();
        }
        else
        {
            schedule.SetAsNonWorkDay();
        }

        if (data.CustomStartTime.HasValue && data.CustomEndTime.HasValue)
        {
            schedule.SetCustomHours(data.CustomStartTime.Value, data.CustomEndTime.Value);
        }
        else
        {
            schedule.ClearCustomHours();
        }

        schedule.SetNotes(data.Notes);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var employee = await _unitOfWork.Employees.GetByIdAsync(schedule.EmployeeId, cancellationToken);
        var shiftEntity = await _unitOfWork.Shifts.GetByIdAsync(schedule.ShiftId, cancellationToken);

        var dto = new WorkScheduleDto
        {
            Id = schedule.Id,
            EmployeeId = schedule.EmployeeId,
            EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : string.Empty,
            ShiftId = schedule.ShiftId,
            ShiftName = shiftEntity?.Name ?? string.Empty,
            Date = schedule.Date,
            IsWorkDay = schedule.IsWorkDay,
            IsHoliday = schedule.IsHoliday,
            HolidayName = schedule.HolidayName,
            CustomStartTime = schedule.CustomStartTime,
            CustomEndTime = schedule.CustomEndTime,
            Notes = schedule.Notes,
            CreatedAt = schedule.CreatedDate
        };

        return Result<WorkScheduleDto>.Success(dto);
    }
}

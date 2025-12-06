using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkSchedules.Commands;

/// <summary>
/// Command to update an existing work schedule
/// </summary>
public class UpdateWorkScheduleCommand : IRequest<Result<WorkScheduleDto>>
{
    public Guid TenantId { get; set; }
    public int ScheduleId { get; set; }
    public UpdateWorkScheduleDto ScheduleData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateWorkScheduleCommand
/// </summary>
public class UpdateWorkScheduleCommandValidator : AbstractValidator<UpdateWorkScheduleCommand>
{
    public UpdateWorkScheduleCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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
    private readonly IWorkScheduleRepository _scheduleRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IShiftRepository _shiftRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateWorkScheduleCommandHandler(
        IWorkScheduleRepository scheduleRepository,
        IEmployeeRepository employeeRepository,
        IShiftRepository shiftRepository,
        IUnitOfWork unitOfWork)
    {
        _scheduleRepository = scheduleRepository;
        _employeeRepository = employeeRepository;
        _shiftRepository = shiftRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<WorkScheduleDto>> Handle(UpdateWorkScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.ScheduleId, cancellationToken);
        if (schedule == null)
        {
            return Result<WorkScheduleDto>.Failure(
                Error.NotFound("WorkSchedule.NotFound", $"Work schedule with ID {request.ScheduleId} not found"));
        }

        var data = request.ScheduleData;

        // Validate shift if changed
        if (schedule.ShiftId != data.ShiftId)
        {
            var shift = await _shiftRepository.GetByIdAsync(data.ShiftId, cancellationToken);
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

        var employee = await _employeeRepository.GetByIdAsync(schedule.EmployeeId, cancellationToken);
        var shiftEntity = await _shiftRepository.GetByIdAsync(schedule.ShiftId, cancellationToken);

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

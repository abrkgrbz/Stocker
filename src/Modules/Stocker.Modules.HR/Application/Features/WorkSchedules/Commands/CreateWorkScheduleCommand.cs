using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkSchedules.Commands;

/// <summary>
/// Command to create a new work schedule
/// </summary>
public class CreateWorkScheduleCommand : IRequest<Result<WorkScheduleDto>>
{
    public Guid TenantId { get; set; }
    public CreateWorkScheduleDto ScheduleData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateWorkScheduleCommand
/// </summary>
public class CreateWorkScheduleCommandValidator : AbstractValidator<CreateWorkScheduleCommand>
{
    public CreateWorkScheduleCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ScheduleData)
            .NotNull().WithMessage("Schedule data is required");

        When(x => x.ScheduleData != null, () =>
        {
            RuleFor(x => x.ScheduleData.EmployeeId)
                .GreaterThan(0).WithMessage("Valid employee ID is required");

            RuleFor(x => x.ScheduleData.ShiftId)
                .GreaterThan(0).WithMessage("Valid shift ID is required");

            RuleFor(x => x.ScheduleData.Date)
                .NotEmpty().WithMessage("Date is required");

            RuleFor(x => x.ScheduleData.Notes)
                .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");
        });
    }
}

/// <summary>
/// Handler for CreateWorkScheduleCommand
/// </summary>
public class CreateWorkScheduleCommandHandler : IRequestHandler<CreateWorkScheduleCommand, Result<WorkScheduleDto>>
{
    private readonly IWorkScheduleRepository _scheduleRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IShiftRepository _shiftRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateWorkScheduleCommandHandler(
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

    public async Task<Result<WorkScheduleDto>> Handle(CreateWorkScheduleCommand request, CancellationToken cancellationToken)
    {
        var data = request.ScheduleData;

        // Validate employee exists
        var employee = await _employeeRepository.GetByIdAsync(data.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<WorkScheduleDto>.Failure(
                Error.NotFound("Employee.NotFound", $"Employee with ID {data.EmployeeId} not found"));
        }

        // Validate shift exists
        var shift = await _shiftRepository.GetByIdAsync(data.ShiftId, cancellationToken);
        if (shift == null)
        {
            return Result<WorkScheduleDto>.Failure(
                Error.NotFound("Shift.NotFound", $"Shift with ID {data.ShiftId} not found"));
        }

        // Check if schedule already exists for this employee/date
        var employeeSchedules = await _scheduleRepository.GetByEmployeeAsync(data.EmployeeId, cancellationToken);
        var existingSchedule = employeeSchedules.FirstOrDefault(s => s.Date.Date == data.Date.Date);
        if (existingSchedule != null)
        {
            return Result<WorkScheduleDto>.Failure(
                Error.Conflict("WorkSchedule.AlreadyExists",
                    $"Schedule already exists for employee {data.EmployeeId} on {data.Date:yyyy-MM-dd}"));
        }

        var schedule = new WorkSchedule(
            data.EmployeeId,
            data.ShiftId,
            data.Date,
            data.IsWorkDay);

        schedule.SetTenantId(request.TenantId);

        if (!string.IsNullOrEmpty(data.Notes))
        {
            schedule.SetNotes(data.Notes);
        }

        await _scheduleRepository.AddAsync(schedule, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WorkScheduleDto
        {
            Id = schedule.Id,
            EmployeeId = schedule.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            ShiftId = schedule.ShiftId,
            ShiftName = shift.Name,
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

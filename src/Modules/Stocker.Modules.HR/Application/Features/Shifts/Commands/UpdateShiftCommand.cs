using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Shifts.Commands;

/// <summary>
/// Command to update an existing shift
/// </summary>
public class UpdateShiftCommand : IRequest<Result<ShiftDto>>
{
    public Guid TenantId { get; set; }
    public int ShiftId { get; set; }
    public UpdateShiftDto ShiftData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateShiftCommand
/// </summary>
public class UpdateShiftCommandValidator : AbstractValidator<UpdateShiftCommand>
{
    public UpdateShiftCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ShiftId)
            .GreaterThan(0).WithMessage("Shift ID is required");

        RuleFor(x => x.ShiftData)
            .NotNull().WithMessage("Shift data is required");

        When(x => x.ShiftData != null, () =>
        {
            RuleFor(x => x.ShiftData.Name)
                .NotEmpty().WithMessage("Name is required")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters");

            RuleFor(x => x.ShiftData.BreakDurationMinutes)
                .GreaterThanOrEqualTo(0).WithMessage("Break duration must be a non-negative value");
        });
    }
}

/// <summary>
/// Handler for UpdateShiftCommand
/// </summary>
public class UpdateShiftCommandHandler : IRequestHandler<UpdateShiftCommand, Result<ShiftDto>>
{
    private readonly IShiftRepository _shiftRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateShiftCommandHandler(
        IShiftRepository shiftRepository,
        IUnitOfWork unitOfWork)
    {
        _shiftRepository = shiftRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShiftDto>> Handle(UpdateShiftCommand request, CancellationToken cancellationToken)
    {
        var shift = await _shiftRepository.GetByIdAsync(request.ShiftId, cancellationToken);
        if (shift == null)
        {
            return Result<ShiftDto>.Failure(
                Error.NotFound("Shift", $"Shift with ID {request.ShiftId} not found"));
        }

        var data = request.ShiftData;

        // Update the shift
        shift.Update(
            data.Name,
            data.Description,
            data.ShiftType,
            data.StartTime,
            data.EndTime,
            data.BreakDurationMinutes,
            data.GracePeriodMinutes ?? shift.GracePeriodMinutes);

        // Update break time
        shift.SetBreakTime(data.BreakStartTime, data.BreakEndTime);

        // Update flexible hours
        shift.SetFlexibleHours(data.IsFlexible, data.FlexibleStartTime, data.FlexibleEndTime);

        // Update night shift allowance if provided
        if (data.NightShiftAllowancePercentage.HasValue)
        {
            shift.SetNightShiftAllowance(data.NightShiftAllowancePercentage.Value);
        }

        // Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get employee count
        var employeeCount = await _shiftRepository.GetEmployeeCountAsync(shift.Id, cancellationToken);

        // Map to DTO
        var shiftDto = new ShiftDto
        {
            Id = shift.Id,
            Code = shift.Code,
            Name = shift.Name,
            Description = shift.Description,
            ShiftType = shift.ShiftType,
            StartTime = shift.StartTime,
            EndTime = shift.EndTime,
            BreakStartTime = shift.BreakStartTime,
            BreakEndTime = shift.BreakEndTime,
            BreakDurationMinutes = shift.BreakDurationMinutes,
            WorkHoursPerDay = shift.WorkHours,
            IsNightShift = shift.IsNightShift,
            NightShiftAllowancePercentage = shift.NightShiftAllowance,
            GracePeriodMinutes = shift.GracePeriodMinutes,
            IsFlexible = shift.IsFlexible,
            FlexibleStartTime = shift.FlexibleStartMin,
            FlexibleEndTime = shift.FlexibleStartMax,
            IsActive = shift.IsActive,
            CreatedAt = shift.CreatedDate,
            UpdatedAt = shift.UpdatedDate,
            EmployeeCount = employeeCount
        };

        return Result<ShiftDto>.Success(shiftDto);
    }
}

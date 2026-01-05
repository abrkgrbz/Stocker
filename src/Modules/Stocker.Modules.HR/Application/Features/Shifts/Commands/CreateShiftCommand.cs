using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Shifts.Commands;

/// <summary>
/// Command to create a new shift
/// </summary>
public record CreateShiftCommand : IRequest<Result<ShiftDto>>
{
    public CreateShiftDto ShiftData { get; init; } = null!;
}

/// <summary>
/// Validator for CreateShiftCommand
/// </summary>
public class CreateShiftCommandValidator : AbstractValidator<CreateShiftCommand>
{
    public CreateShiftCommandValidator()
    {
        RuleFor(x => x.ShiftData)
            .NotNull().WithMessage("Shift data is required");

        When(x => x.ShiftData != null, () =>
        {
            RuleFor(x => x.ShiftData.Code)
                .NotEmpty().WithMessage("Code is required")
                .MaximumLength(20).WithMessage("Code must not exceed 20 characters");

            RuleFor(x => x.ShiftData.Name)
                .NotEmpty().WithMessage("Name is required")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters");

            RuleFor(x => x.ShiftData.BreakDurationMinutes)
                .GreaterThanOrEqualTo(0).WithMessage("Break duration must be a non-negative value");
        });
    }
}

/// <summary>
/// Handler for CreateShiftCommand
/// </summary>
public class CreateShiftCommandHandler : IRequestHandler<CreateShiftCommand, Result<ShiftDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateShiftCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShiftDto>> Handle(CreateShiftCommand request, CancellationToken cancellationToken)
    {
        var data = request.ShiftData;

        // Check if shift with same code already exists
        if (await _unitOfWork.Shifts.ExistsWithCodeAsync(data.Code, cancellationToken: cancellationToken))
        {
            return Result<ShiftDto>.Failure(
                Error.Conflict("Shift.Code", "A shift with this code already exists"));
        }

        // Create the shift
        var shift = new Shift(
            data.Code,
            data.Name,
            data.ShiftType,
            data.StartTime,
            data.EndTime,
            data.BreakDurationMinutes,
            data.GracePeriodMinutes ?? 15,
            data.Description);

        // Set tenant ID
        shift.SetTenantId(_unitOfWork.TenantId);

        // Set break time if provided
        if (data.BreakStartTime.HasValue || data.BreakEndTime.HasValue)
        {
            shift.SetBreakTime(data.BreakStartTime, data.BreakEndTime);
        }

        // Set flexible hours if specified
        if (data.IsFlexible)
        {
            shift.SetFlexibleHours(true, data.FlexibleStartTime, data.FlexibleEndTime);
        }

        // Set night shift allowance if provided
        if (data.NightShiftAllowancePercentage.HasValue)
        {
            shift.SetNightShiftAllowance(data.NightShiftAllowancePercentage.Value);
        }

        // Save to repository
        await _unitOfWork.Shifts.AddAsync(shift, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
            EmployeeCount = 0
        };

        return Result<ShiftDto>.Success(shiftDto);
    }
}

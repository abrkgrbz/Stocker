using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Shifts.Commands;

/// <summary>
/// Command to activate a shift
/// </summary>
public record ActivateShiftCommand(int ShiftId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for ActivateShiftCommand
/// </summary>
public class ActivateShiftCommandValidator : AbstractValidator<ActivateShiftCommand>
{
    public ActivateShiftCommandValidator()
    {
        RuleFor(x => x.ShiftId)
            .GreaterThan(0).WithMessage("Shift ID must be greater than 0");
    }
}

/// <summary>
/// Handler for ActivateShiftCommand
/// </summary>
public class ActivateShiftCommandHandler : IRequestHandler<ActivateShiftCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public ActivateShiftCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateShiftCommand request, CancellationToken cancellationToken)
    {
        var shift = await _unitOfWork.Shifts.GetByIdAsync(request.ShiftId, cancellationToken);
        if (shift == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Shift", $"Shift with ID {request.ShiftId} not found"));
        }

        if (shift.IsActive)
        {
            return Result<bool>.Failure(
                Error.Conflict("Shift", "Shift is already active"));
        }

        shift.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Shifts.Commands;

/// <summary>
/// Command to deactivate a shift
/// </summary>
public record DeactivateShiftCommand(int ShiftId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeactivateShiftCommand
/// </summary>
public class DeactivateShiftCommandValidator : AbstractValidator<DeactivateShiftCommand>
{
    public DeactivateShiftCommandValidator()
    {
        RuleFor(x => x.ShiftId)
            .GreaterThan(0).WithMessage("Shift ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeactivateShiftCommand
/// </summary>
public class DeactivateShiftCommandHandler : IRequestHandler<DeactivateShiftCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeactivateShiftCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateShiftCommand request, CancellationToken cancellationToken)
    {
        var shift = await _unitOfWork.Shifts.GetByIdAsync(request.ShiftId, cancellationToken);
        if (shift == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Shift", $"Shift with ID {request.ShiftId} not found"));
        }

        if (!shift.IsActive)
        {
            return Result<bool>.Failure(
                Error.Conflict("Shift", "Shift is already inactive"));
        }

        shift.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

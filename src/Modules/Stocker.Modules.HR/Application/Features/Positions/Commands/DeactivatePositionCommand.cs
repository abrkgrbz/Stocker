using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Positions.Commands;

/// <summary>
/// Command to deactivate a position
/// </summary>
public record DeactivatePositionCommand(int PositionId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeactivatePositionCommand
/// </summary>
public class DeactivatePositionCommandValidator : AbstractValidator<DeactivatePositionCommand>
{
    public DeactivatePositionCommandValidator()
    {
        RuleFor(x => x.PositionId)
            .GreaterThan(0).WithMessage("Position ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeactivatePositionCommand
/// </summary>
public class DeactivatePositionCommandHandler : IRequestHandler<DeactivatePositionCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeactivatePositionCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivatePositionCommand request, CancellationToken cancellationToken)
    {
        var position = await _unitOfWork.Positions.GetByIdAsync(request.PositionId, cancellationToken);
        if (position == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Position", $"Position with ID {request.PositionId} not found"));
        }

        if (!position.IsActive)
        {
            return Result<bool>.Failure(
                Error.Conflict("Position", "Position is already inactive"));
        }

        position.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

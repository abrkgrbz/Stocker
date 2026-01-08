using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Positions.Commands;

/// <summary>
/// Command to activate a position
/// </summary>
public record ActivatePositionCommand(int PositionId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for ActivatePositionCommand
/// </summary>
public class ActivatePositionCommandValidator : AbstractValidator<ActivatePositionCommand>
{
    public ActivatePositionCommandValidator()
    {
        RuleFor(x => x.PositionId)
            .GreaterThan(0).WithMessage("Position ID must be greater than 0");
    }
}

/// <summary>
/// Handler for ActivatePositionCommand
/// </summary>
public class ActivatePositionCommandHandler : IRequestHandler<ActivatePositionCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public ActivatePositionCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivatePositionCommand request, CancellationToken cancellationToken)
    {
        var position = await _unitOfWork.Positions.GetByIdAsync(request.PositionId, cancellationToken);
        if (position == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Position", $"Position with ID {request.PositionId} not found"));
        }

        if (position.IsActive)
        {
            return Result<bool>.Failure(
                Error.Conflict("Position", "Position is already active"));
        }

        position.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Positions.Commands;

/// <summary>
/// Command to delete a position
/// </summary>
public record DeletePositionCommand(int PositionId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeletePositionCommand
/// </summary>
public class DeletePositionCommandValidator : AbstractValidator<DeletePositionCommand>
{
    public DeletePositionCommandValidator()
    {
        RuleFor(x => x.PositionId)
            .GreaterThan(0).WithMessage("Position ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeletePositionCommand
/// </summary>
public class DeletePositionCommandHandler : IRequestHandler<DeletePositionCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeletePositionCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeletePositionCommand request, CancellationToken cancellationToken)
    {
        // Get existing position
        var position = await _unitOfWork.Positions.GetByIdAsync(request.PositionId, cancellationToken);
        if (position == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Position", $"Position with ID {request.PositionId} not found"));
        }

        // Check if position has employees
        var employeeCount = await _unitOfWork.Positions.GetEmployeeCountAsync(request.PositionId, cancellationToken);
        if (employeeCount > 0)
        {
            return Result<bool>.Failure(
                Error.Conflict("Position", $"Cannot delete position with {employeeCount} employees. Please reassign employees first."));
        }

        // Soft delete (deactivate)
        _unitOfWork.Positions.Remove(position);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

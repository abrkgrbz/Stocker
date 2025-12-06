using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Positions.Commands;

/// <summary>
/// Command to delete a position
/// </summary>
public class DeletePositionCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int PositionId { get; set; }
}

/// <summary>
/// Validator for DeletePositionCommand
/// </summary>
public class DeletePositionCommandValidator : AbstractValidator<DeletePositionCommand>
{
    public DeletePositionCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.PositionId)
            .GreaterThan(0).WithMessage("Position ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeletePositionCommand
/// </summary>
public class DeletePositionCommandHandler : IRequestHandler<DeletePositionCommand, Result<bool>>
{
    private readonly IPositionRepository _positionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeletePositionCommandHandler(
        IPositionRepository positionRepository,
        IUnitOfWork unitOfWork)
    {
        _positionRepository = positionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeletePositionCommand request, CancellationToken cancellationToken)
    {
        // Get existing position
        var position = await _positionRepository.GetByIdAsync(request.PositionId, cancellationToken);
        if (position == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Position", $"Position with ID {request.PositionId} not found"));
        }

        // Check if position has employees
        var employeeCount = await _positionRepository.GetEmployeeCountAsync(request.PositionId, cancellationToken);
        if (employeeCount > 0)
        {
            return Result<bool>.Failure(
                Error.Conflict("Position", $"Cannot delete position with {employeeCount} employees. Please reassign employees first."));
        }

        // Soft delete (deactivate)
        _positionRepository.Remove(position);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

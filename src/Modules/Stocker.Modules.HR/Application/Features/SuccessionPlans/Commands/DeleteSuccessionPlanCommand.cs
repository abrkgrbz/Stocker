using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.SuccessionPlans.Commands;

/// <summary>
/// Command to delete a succession plan
/// </summary>
public record DeleteSuccessionPlanCommand : IRequest<Result<bool>>
{
    public int SuccessionPlanId { get; init; }
}

/// <summary>
/// Handler for DeleteSuccessionPlanCommand
/// </summary>
public class DeleteSuccessionPlanCommandHandler : IRequestHandler<DeleteSuccessionPlanCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteSuccessionPlanCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteSuccessionPlanCommand request, CancellationToken cancellationToken)
    {
        // Get existing succession plan
        var successionPlan = await _unitOfWork.SuccessionPlans.GetByIdAsync(request.SuccessionPlanId, cancellationToken);
        if (successionPlan == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("SuccessionPlan", $"Succession plan with ID {request.SuccessionPlanId} not found"));
        }

        // Check if succession plan can be deleted
        if (successionPlan.Status == SuccessionPlanStatus.Completed)
        {
            return Result<bool>.Failure(
                Error.Conflict("SuccessionPlan", "Cannot delete completed succession plan"));
        }

        if (successionPlan.Status == SuccessionPlanStatus.Active && successionPlan.HasReadyCandidate)
        {
            return Result<bool>.Failure(
                Error.Conflict("SuccessionPlan", "Cannot delete active succession plan with ready candidates. Please complete or cancel it first."));
        }

        // Delete the succession plan
        _unitOfWork.SuccessionPlans.Remove(successionPlan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

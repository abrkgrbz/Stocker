using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.SuccessionPlans.Commands;

/// <summary>
/// Command to delete a succession plan
/// </summary>
public record DeleteSuccessionPlanCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; init; }
    public int SuccessionPlanId { get; init; }
}

/// <summary>
/// Handler for DeleteSuccessionPlanCommand
/// </summary>
public class DeleteSuccessionPlanCommandHandler : IRequestHandler<DeleteSuccessionPlanCommand, Result<bool>>
{
    private readonly ISuccessionPlanRepository _successionPlanRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteSuccessionPlanCommandHandler(
        ISuccessionPlanRepository successionPlanRepository,
        IUnitOfWork unitOfWork)
    {
        _successionPlanRepository = successionPlanRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteSuccessionPlanCommand request, CancellationToken cancellationToken)
    {
        // Get existing succession plan
        var successionPlan = await _successionPlanRepository.GetByIdAsync(request.SuccessionPlanId, cancellationToken);
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
        _successionPlanRepository.Remove(successionPlan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Commands;

public class UpdateLoyaltyMembershipCommandHandler : IRequestHandler<UpdateLoyaltyMembershipCommand, Result<bool>>
{
    private readonly ILoyaltyMembershipRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public UpdateLoyaltyMembershipCommandHandler(
        ILoyaltyMembershipRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateLoyaltyMembershipCommand request, CancellationToken cancellationToken)
    {
        var membership = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (membership == null)
            return Result<bool>.Failure(Error.NotFound("LoyaltyMembership.NotFound", "Loyalty membership not found"));

        if (membership.TenantId != request.TenantId)
            return Result<bool>.Failure(Error.Forbidden("LoyaltyMembership.Forbidden", "Access denied"));

        if (request.CurrentTierId.HasValue)
            membership.SetTier(request.CurrentTierId.Value);

        var description = request.TransactionDescription ?? "Points transaction";

        if (request.PointsToEarn.HasValue && request.PointsToEarn.Value > 0)
            membership.EarnPoints(request.PointsToEarn.Value, description);

        if (request.PointsToRedeem.HasValue && request.PointsToRedeem.Value > 0)
            membership.RedeemPoints(request.PointsToRedeem.Value, description);

        if (request.PointsToAdjust.HasValue && request.PointsToAdjust.Value != 0)
            membership.AdjustPoints(request.PointsToAdjust.Value, description);

        if (request.PointsToExpire.HasValue && request.PointsToExpire.Value > 0)
            membership.ExpirePoints(request.PointsToExpire.Value, description);

        if (request.PointsExpiryDate.HasValue)
            membership.SetPointsExpiryDate(request.PointsExpiryDate);

        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value)
                membership.Activate();
            else
                membership.Deactivate();
        }

        await _repository.UpdateAsync(membership, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

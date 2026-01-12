using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Commands;

public class DeleteLoyaltyMembershipCommandHandler : IRequestHandler<DeleteLoyaltyMembershipCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteLoyaltyMembershipCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteLoyaltyMembershipCommand request, CancellationToken cancellationToken)
    {
        var membership = await _unitOfWork.LoyaltyMemberships.GetByIdAsync(request.Id, cancellationToken);

        if (membership == null)
            return Result<bool>.Failure(Error.NotFound("LoyaltyMembership.NotFound", "Loyalty membership not found"));

        if (membership.TenantId != _unitOfWork.TenantId)
            return Result<bool>.Failure(Error.Forbidden("LoyaltyMembership.Forbidden", "Access denied"));

        await _unitOfWork.LoyaltyMemberships.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

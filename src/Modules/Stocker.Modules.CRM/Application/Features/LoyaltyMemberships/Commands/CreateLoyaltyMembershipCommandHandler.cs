using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Commands;

public class CreateLoyaltyMembershipCommandHandler : IRequestHandler<CreateLoyaltyMembershipCommand, Result<Guid>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CreateLoyaltyMembershipCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateLoyaltyMembershipCommand request, CancellationToken cancellationToken)
    {
        var membership = new LoyaltyMembership(
            _unitOfWork.TenantId,
            request.LoyaltyProgramId,
            request.CustomerId,
            request.MembershipNumber);

        if (request.CurrentTierId.HasValue)
            membership.SetTier(request.CurrentTierId.Value);

        if (request.InitialPoints > 0)
            membership.EarnPoints(request.InitialPoints, "Initial enrollment bonus");

        if (!request.IsActive)
            membership.Deactivate();

        await _unitOfWork.LoyaltyMemberships.CreateAsync(membership, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(membership.Id);
    }
}

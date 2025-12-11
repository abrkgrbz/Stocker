using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Repositories;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Commands;

public class CreateLoyaltyMembershipCommandHandler : IRequestHandler<CreateLoyaltyMembershipCommand, Result<Guid>>
{
    private readonly ILoyaltyMembershipRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreateLoyaltyMembershipCommandHandler(
        ILoyaltyMembershipRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateLoyaltyMembershipCommand request, CancellationToken cancellationToken)
    {
        var membership = new LoyaltyMembership(
            request.TenantId,
            request.LoyaltyProgramId,
            request.CustomerId,
            request.MembershipNumber);

        if (request.CurrentTierId.HasValue)
            membership.SetTier(request.CurrentTierId.Value);

        if (request.InitialPoints > 0)
            membership.EarnPoints(request.InitialPoints, "Initial enrollment bonus");

        if (!request.IsActive)
            membership.Deactivate();

        await _repository.CreateAsync(membership, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(membership.Id);
    }
}

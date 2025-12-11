using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Commands;

public class DeleteLoyaltyMembershipCommandHandler : IRequestHandler<DeleteLoyaltyMembershipCommand, Result<bool>>
{
    private readonly ILoyaltyMembershipRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteLoyaltyMembershipCommandHandler(
        ILoyaltyMembershipRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteLoyaltyMembershipCommand request, CancellationToken cancellationToken)
    {
        var membership = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (membership == null)
            return Result<bool>.Failure(Error.NotFound("LoyaltyMembership.NotFound", "Loyalty membership not found"));

        if (membership.TenantId != request.TenantId)
            return Result<bool>.Failure(Error.Forbidden("LoyaltyMembership.Forbidden", "Access denied"));

        await _repository.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

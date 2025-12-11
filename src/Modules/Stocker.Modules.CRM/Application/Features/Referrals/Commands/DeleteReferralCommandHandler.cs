using MediatR;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Referrals.Commands;

public class DeleteReferralCommandHandler : IRequestHandler<DeleteReferralCommand, Result<bool>>
{
    private readonly IReferralRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteReferralCommandHandler(
        IReferralRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteReferralCommand request, CancellationToken cancellationToken)
    {
        var referral = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (referral == null)
        {
            return Result<bool>.Failure(Error.NotFound("Referral.NotFound", $"Referral with ID {request.Id} not found"));
        }

        if (referral.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("Referral.Forbidden", "You don't have permission to delete this referral"));
        }

        await _repository.DeleteAsync(referral.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

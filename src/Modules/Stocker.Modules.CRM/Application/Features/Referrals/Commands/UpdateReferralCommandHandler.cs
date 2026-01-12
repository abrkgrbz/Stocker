using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Referrals.Commands;

public class UpdateReferralCommandHandler : IRequestHandler<UpdateReferralCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateReferralCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateReferralCommand request, CancellationToken cancellationToken)
    {
        var referral = await _unitOfWork.Referrals.GetByIdAsync(request.Id, cancellationToken);

        if (referral == null)
        {
            return Result<bool>.Failure(Error.NotFound("Referral.NotFound", $"Referral with ID {request.Id} not found"));
        }

        if (referral.TenantId != _unitOfWork.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("Referral.Forbidden", "You don't have permission to update this referral"));
        }

        if (request.ReferralType.HasValue)
            referral.SetReferralType(request.ReferralType.Value);

        if (!string.IsNullOrEmpty(request.ReferrerEmail))
            referral.SetReferrerEmail(request.ReferrerEmail);

        if (!string.IsNullOrEmpty(request.ReferrerPhone))
            referral.SetReferrerPhone(request.ReferrerPhone);

        if (!string.IsNullOrEmpty(request.Currency))
            referral.SetCurrency(request.Currency);

        if (request.ExpiryDate.HasValue)
            referral.SetExpiryDate(request.ExpiryDate);

        if (!string.IsNullOrEmpty(request.ReferralMessage))
            referral.SetReferralMessage(request.ReferralMessage);

        if (!string.IsNullOrEmpty(request.InternalNotes))
            referral.SetInternalNotes(request.InternalNotes);

        if (request.AssignedToUserId.HasValue)
            referral.SetAssignedTo(request.AssignedToUserId.Value);

        if (request.TotalSalesAmount.HasValue)
            referral.SetTotalSalesAmount(request.TotalSalesAmount.Value);

        await _unitOfWork.Referrals.UpdateAsync(referral, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

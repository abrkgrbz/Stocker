using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Referrals.Commands;

public class CreateReferralCommandHandler : IRequestHandler<CreateReferralCommand, Result<Guid>>
{
    private readonly IReferralRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreateReferralCommandHandler(
        IReferralRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateReferralCommand request, CancellationToken cancellationToken)
    {
        var referral = new Referral(
            request.TenantId,
            request.ReferralCode,
            request.ReferrerName,
            request.ReferredName);

        referral.SetReferralType(request.ReferralType);

        if (request.ReferrerCustomerId.HasValue)
            referral.SetReferrerCustomer(request.ReferrerCustomerId.Value);

        if (request.ReferrerContactId.HasValue)
            referral.SetReferrerContact(request.ReferrerContactId.Value);

        if (!string.IsNullOrEmpty(request.ReferrerEmail))
            referral.SetReferrerEmail(request.ReferrerEmail);

        if (!string.IsNullOrEmpty(request.ReferrerPhone))
            referral.SetReferrerPhone(request.ReferrerPhone);

        referral.SetReferredDetails(request.ReferredName, request.ReferredEmail, request.ReferredPhone, request.ReferredCompany);

        if (request.ReferrerReward.HasValue || request.ReferredReward.HasValue || request.RewardType.HasValue)
            referral.SetRewards(request.ReferrerReward, request.ReferredReward, request.RewardType ?? Domain.Entities.RewardType.Cash);

        if (!string.IsNullOrEmpty(request.Currency))
            referral.SetCurrency(request.Currency);

        if (request.ExpiryDate.HasValue)
            referral.SetExpiryDate(request.ExpiryDate);

        if (request.CampaignId.HasValue)
            referral.SetCampaign(request.CampaignId.Value, request.ProgramName);

        if (!string.IsNullOrEmpty(request.ReferralMessage))
            referral.SetReferralMessage(request.ReferralMessage);

        if (!string.IsNullOrEmpty(request.InternalNotes))
            referral.SetInternalNotes(request.InternalNotes);

        if (request.AssignedToUserId.HasValue)
            referral.SetAssignedTo(request.AssignedToUserId.Value);

        await _repository.CreateAsync(referral, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(referral.Id);
    }
}

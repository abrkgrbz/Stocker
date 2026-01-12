using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Commands;

public class CreateSocialMediaProfileCommandHandler : IRequestHandler<CreateSocialMediaProfileCommand, Result<Guid>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CreateSocialMediaProfileCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateSocialMediaProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = new SocialMediaProfile(
            _unitOfWork.TenantId,
            request.Platform,
            request.ProfileUrl);

        if (request.Username != null)
            profile.SetUsername(request.Username);

        if (request.ProfileId != null)
            profile.SetProfileId(request.ProfileId);

        if (request.CustomerId.HasValue)
            profile.RelateToCustomer(request.CustomerId.Value);

        if (request.ContactId.HasValue)
            profile.RelateToContact(request.ContactId.Value);

        if (request.LeadId.HasValue)
            profile.RelateToLead(request.LeadId.Value);

        if (request.DisplayName != null || request.Bio != null || request.ProfileImageUrl != null || request.Website != null || request.Location != null)
        {
            profile.UpdateProfileInfo(
                request.DisplayName,
                request.Bio,
                request.ProfileImageUrl,
                request.Website,
                request.Location);
        }

        if (request.CoverImageUrl != null)
            profile.SetCoverImageUrl(request.CoverImageUrl);

        profile.SetVerified(request.IsVerified);

        if (!request.IsActive)
            profile.Deactivate();

        await _unitOfWork.SocialMediaProfiles.CreateAsync(profile, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(profile.Id);
    }
}

using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Commands;

public class UpdateSocialMediaProfileCommandHandler : IRequestHandler<UpdateSocialMediaProfileCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateSocialMediaProfileCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateSocialMediaProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await _unitOfWork.SocialMediaProfiles.GetByIdAsync(request.Id, cancellationToken);

        if (profile == null)
            return Result<bool>.Failure(Error.NotFound("SocialMediaProfile.NotFound", "Social media profile not found"));

        if (profile.TenantId != _unitOfWork.TenantId)
            return Result<bool>.Failure(Error.Forbidden("SocialMediaProfile.Forbidden", "Access denied"));

        if (request.Username != null)
            profile.SetUsername(request.Username);

        if (request.ProfileId != null)
            profile.SetProfileId(request.ProfileId);

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

        if (request.FollowersCount.HasValue || request.FollowingCount.HasValue || request.PostsCount.HasValue || request.LikesCount.HasValue)
        {
            profile.UpdateStatistics(
                request.FollowersCount,
                request.FollowingCount,
                request.PostsCount,
                request.LikesCount);
        }

        if (request.EngagementRate.HasValue)
        {
            profile.UpdateEngagementMetrics(request.EngagementRate, null, null, null);
        }

        if (request.Notes != null)
            profile.SetNotes(request.Notes);

        if (request.Tags != null)
            profile.SetTags(request.Tags);

        if (request.IsVerified.HasValue)
            profile.SetVerified(request.IsVerified.Value);

        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value)
                profile.Activate();
            else
                profile.Deactivate();
        }

        await _unitOfWork.SocialMediaProfiles.UpdateAsync(profile, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

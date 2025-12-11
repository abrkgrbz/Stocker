using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Queries;

public class GetSocialMediaProfileByIdQueryHandler : IRequestHandler<GetSocialMediaProfileByIdQuery, Result<SocialMediaProfileDto?>>
{
    private readonly ISocialMediaProfileRepository _repository;

    public GetSocialMediaProfileByIdQueryHandler(ISocialMediaProfileRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<Result<SocialMediaProfileDto?>> Handle(GetSocialMediaProfileByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<SocialMediaProfileDto?>.Failure(new Error("SocialMediaProfile.NotFound", "Social media profile not found", ErrorType.NotFound));
        }

        var dto = new SocialMediaProfileDto
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            Platform = entity.Platform,
            ProfileUrl = entity.ProfileUrl,
            Username = entity.Username,
            ProfileId = entity.ProfileId,
            IsActive = entity.IsActive,
            IsVerified = entity.IsVerified,
            CustomerId = entity.CustomerId,
            ContactId = entity.ContactId,
            LeadId = entity.LeadId,
            DisplayName = entity.DisplayName,
            Bio = entity.Bio,
            ProfileImageUrl = entity.ProfileImageUrl,
            CoverImageUrl = entity.CoverImageUrl,
            Website = entity.Website,
            Location = entity.Location,
            FollowersCount = entity.FollowersCount,
            FollowingCount = entity.FollowingCount,
            PostsCount = entity.PostsCount,
            LikesCount = entity.LikesCount,
            StatsUpdatedAt = entity.StatsUpdatedAt,
            EngagementRate = entity.EngagementRate,
            AverageLikesPerPost = entity.AverageLikesPerPost,
            AverageCommentsPerPost = entity.AverageCommentsPerPost,
            AverageSharesPerPost = entity.AverageSharesPerPost,
            InfluencerLevel = entity.InfluencerLevel,
            InfluenceScore = entity.InfluenceScore,
            TargetAudience = entity.TargetAudience,
            ContentCategories = entity.ContentCategories,
            LastInteractionDate = entity.LastInteractionDate,
            LastInteractionType = entity.LastInteractionType,
            TotalInteractionsCount = entity.TotalInteractionsCount,
            FollowsOurBrand = entity.FollowsOurBrand,
            MentionedOurBrand = entity.MentionedOurBrand,
            LastBrandMentionDate = entity.LastBrandMentionDate,
            HasActiveCampaign = entity.HasActiveCampaign,
            CampaignId = entity.CampaignId,
            CollaborationStatus = entity.CollaborationStatus,
            Notes = entity.Notes,
            Tags = entity.Tags
        };

        return Result<SocialMediaProfileDto?>.Success(dto);
    }
}

using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Queries;

public class GetSocialMediaProfilesQueryHandler : IRequestHandler<GetSocialMediaProfilesQuery, Result<List<SocialMediaProfileDto>>>
{
    private readonly ISocialMediaProfileRepository _repository;

    public GetSocialMediaProfilesQueryHandler(ISocialMediaProfileRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<Result<List<SocialMediaProfileDto>>> Handle(GetSocialMediaProfilesQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(
            request.CustomerId,
            request.ContactId,
            request.Platform,
            request.IsActive,
            request.Skip,
            request.Take,
            cancellationToken);

        var dtos = entities.Select(entity => new SocialMediaProfileDto
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
        }).ToList();

        return Result<List<SocialMediaProfileDto>>.Success(dtos);
    }
}

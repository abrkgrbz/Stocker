using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Commands;

public record UpdateSocialMediaProfileCommand(
    Guid Id,
    Guid TenantId,
    string? Username = null,
    string? ProfileId = null,
    string? DisplayName = null,
    string? Bio = null,
    string? ProfileImageUrl = null,
    string? CoverImageUrl = null,
    string? Website = null,
    string? Location = null,
    int? FollowersCount = null,
    int? FollowingCount = null,
    int? PostsCount = null,
    int? LikesCount = null,
    decimal? EngagementRate = null,
    bool? IsActive = null,
    bool? IsVerified = null,
    string? Notes = null,
    string? Tags = null
) : IRequest<Result<bool>>;

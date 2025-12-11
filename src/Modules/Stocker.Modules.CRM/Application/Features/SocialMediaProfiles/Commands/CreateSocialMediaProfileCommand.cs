using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Commands;

public record CreateSocialMediaProfileCommand(
    Guid TenantId,
    SocialMediaPlatform Platform,
    string ProfileUrl,
    string? Username = null,
    string? ProfileId = null,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    Guid? LeadId = null,
    string? DisplayName = null,
    string? Bio = null,
    string? ProfileImageUrl = null,
    string? CoverImageUrl = null,
    string? Website = null,
    string? Location = null,
    bool IsActive = true,
    bool IsVerified = false
) : IRequest<Result<Guid>>;

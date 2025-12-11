using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Queries;

public record GetSocialMediaProfilesQuery(
    SocialMediaPlatform? Platform = null,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    bool? IsActive = null,
    int Skip = 0,
    int Take = 100
) : IRequest<Result<List<SocialMediaProfileDto>>>;

using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Commands;

public record DeleteSocialMediaProfileCommand(
    Guid Id,
    Guid TenantId
) : IRequest<Result<bool>>;

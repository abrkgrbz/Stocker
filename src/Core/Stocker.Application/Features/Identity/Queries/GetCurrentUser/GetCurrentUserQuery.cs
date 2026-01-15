using MediatR;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<Result<UserInfo>>
{
    public Guid UserId { get; init; }

    /// <summary>
    /// For invited users (users without MasterUser association), this is their TenantUser ID
    /// </summary>
    public Guid? TenantUserId { get; init; }

    /// <summary>
    /// Indicates if this is an invited user (no MasterUser record)
    /// </summary>
    public bool IsInvitedUser { get; init; }

    /// <summary>
    /// The tenant ID from the JWT claims
    /// </summary>
    public Guid? TenantId { get; init; }
}

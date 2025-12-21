using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Users.Commands;

/// <summary>
/// Command for resending the invitation email to a user who hasn't activated their account yet.
/// </summary>
public class ResendInvitationCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string InviterName { get; set; } = string.Empty;
}

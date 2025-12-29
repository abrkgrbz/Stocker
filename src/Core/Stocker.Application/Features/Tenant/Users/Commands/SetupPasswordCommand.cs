using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Users.Commands;

/// <summary>
/// Command for setting up password during account activation.
/// Used when a user clicks the activation link from their invitation email.
/// Returns authentication tokens for auto-login.
/// </summary>
public class SetupPasswordCommand : IRequest<Result<SetupPasswordResultDto>>
{
    /// <summary>
    /// The tenant ID where the user belongs.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// The user ID to activate.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// The activation token from the invitation email.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// The new password chosen by the user.
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Password confirmation for validation.
    /// </summary>
    public string ConfirmPassword { get; set; } = string.Empty;
}

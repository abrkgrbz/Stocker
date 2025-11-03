using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Commands;

/// <summary>
/// Command to update session management settings
/// </summary>
public class UpdateSessionSettingsCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public int MaxConcurrentSessions { get; set; }
    public bool RequireReauthForCriticalOps { get; set; }
    public string ModifiedBy { get; set; } = string.Empty;
}

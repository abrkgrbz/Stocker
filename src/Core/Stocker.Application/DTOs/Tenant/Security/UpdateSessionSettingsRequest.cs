namespace Stocker.Application.DTOs.Tenant.Security;

/// <summary>
/// Request to update session management settings
/// </summary>
public class UpdateSessionSettingsRequest
{
    public int SessionTimeoutMinutes { get; set; }
    public int MaxConcurrentSessions { get; set; }
    public bool RequireReauthForCriticalOps { get; set; }
}

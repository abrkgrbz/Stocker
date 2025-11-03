namespace Stocker.Application.DTOs.Tenant.Security;

/// <summary>
/// Session management settings
/// </summary>
public class SessionSettingsDto
{
    public int SessionTimeoutMinutes { get; set; }
    public int MaxConcurrentSessions { get; set; }
    public bool RequireReauthForCriticalOps { get; set; }
}

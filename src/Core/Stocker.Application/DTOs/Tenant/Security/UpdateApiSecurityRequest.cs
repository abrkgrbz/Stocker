namespace Stocker.Application.DTOs.Tenant.Security;

/// <summary>
/// Request to update API security settings
/// </summary>
public class UpdateApiSecurityRequest
{
    public bool AllowApiAccess { get; set; }
    public bool RequireApiKey { get; set; }
    public int ApiKeyExpiryDays { get; set; }
    public bool RateLimitEnabled { get; set; }
    public int RateLimitRequestsPerHour { get; set; }
}

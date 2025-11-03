using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Commands;

/// <summary>
/// Command to update API security settings
/// </summary>
public class UpdateApiSecurityCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public bool AllowApiAccess { get; set; }
    public bool RequireApiKey { get; set; }
    public int ApiKeyExpiryDays { get; set; }
    public bool RateLimitEnabled { get; set; }
    public int RateLimitRequestsPerHour { get; set; }
    public string ModifiedBy { get; set; } = string.Empty;
}

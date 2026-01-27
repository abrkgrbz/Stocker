using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.LoginToTenant;

/// <summary>
/// Command for master admin to login/impersonate a tenant
/// </summary>
public class LoginToTenantCommand : IRequest<Result<LoginToTenantResponse>>
{
    public Guid TenantId { get; set; }
    public string MasterUserId { get; set; } = string.Empty;
    public string MasterUserEmail { get; set; } = string.Empty;
}

public class LoginToTenantResponse
{
    public Guid TenantId { get; set; }
    public string TenantCode { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string RedirectUrl { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public DateTime ExpiresAt { get; set; }
}

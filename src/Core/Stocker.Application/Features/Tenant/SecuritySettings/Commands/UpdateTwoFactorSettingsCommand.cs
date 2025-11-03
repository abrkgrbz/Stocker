using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Commands;

/// <summary>
/// Command to update two-factor authentication settings
/// </summary>
public class UpdateTwoFactorSettingsCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public bool Require2FA { get; set; }
    public bool Allow2FA { get; set; }
    public bool TrustedDevices { get; set; }
    public int TrustedDeviceDays { get; set; }
    public string ModifiedBy { get; set; } = string.Empty;
}

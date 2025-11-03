namespace Stocker.Application.DTOs.Tenant.Security;

/// <summary>
/// Request to update two-factor authentication settings
/// </summary>
public class UpdateTwoFactorSettingsRequest
{
    public bool Require2FA { get; set; }
    public bool Allow2FA { get; set; }
    public bool TrustedDevices { get; set; }
    public int TrustedDeviceDays { get; set; }
}

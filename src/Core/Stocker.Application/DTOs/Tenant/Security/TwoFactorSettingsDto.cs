namespace Stocker.Application.DTOs.Tenant.Security;

/// <summary>
/// Two-factor authentication settings
/// </summary>
public class TwoFactorSettingsDto
{
    public bool Require2FA { get; set; }
    public bool Allow2FA { get; set; }
    public bool TrustedDevices { get; set; }
    public int TrustedDeviceDays { get; set; }
}

namespace Stocker.Application.DTOs.Tenant.Security;

/// <summary>
/// Complete security settings for a tenant
/// </summary>
public class SecuritySettingsDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public PasswordPolicyDto PasswordPolicy { get; set; } = null!;
    public TwoFactorSettingsDto TwoFactorSettings { get; set; } = null!;
    public SessionSettingsDto SessionSettings { get; set; } = null!;
    public ApiSecuritySettingsDto ApiSecurity { get; set; } = null!;
    public DateTime? LastModifiedAt { get; set; }
    public string? LastModifiedBy { get; set; }
}

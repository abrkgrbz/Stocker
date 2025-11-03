namespace Stocker.Application.DTOs.Tenant.Security;

/// <summary>
/// Password policy settings
/// </summary>
public class PasswordPolicyDto
{
    public int MinPasswordLength { get; set; }
    public bool RequireUppercase { get; set; }
    public bool RequireLowercase { get; set; }
    public bool RequireNumbers { get; set; }
    public bool RequireSpecialChars { get; set; }
    public int PasswordExpiryDays { get; set; }
    public int PreventPasswordReuse { get; set; }
}

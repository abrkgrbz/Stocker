using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Commands;

/// <summary>
/// Command to update password policy settings
/// </summary>
public class UpdatePasswordPolicyCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int MinPasswordLength { get; set; }
    public bool RequireUppercase { get; set; }
    public bool RequireLowercase { get; set; }
    public bool RequireNumbers { get; set; }
    public bool RequireSpecialChars { get; set; }
    public int PasswordExpiryDays { get; set; }
    public int PreventPasswordReuse { get; set; }
    public string ModifiedBy { get; set; } = string.Empty;
}

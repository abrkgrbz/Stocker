namespace Stocker.Application.Features.TenantRegistration.Commands.ResendVerificationEmail;

public sealed class ResendTenantVerificationEmailResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

namespace Stocker.Application.Features.Identity.Commands.VerifyEmail;

public sealed class VerifyEmailResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? RedirectUrl { get; set; }
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
}
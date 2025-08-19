namespace Stocker.Application.Features.Identity.Commands.ResendVerificationEmail;

public sealed class ResendVerificationEmailResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
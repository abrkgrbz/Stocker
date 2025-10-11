using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.ForgotPassword;

public record ForgotPasswordCommand : IRequest<Result<ForgotPasswordResponse>>
{
    public string Email { get; init; } = string.Empty;
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
}

public class ForgotPasswordResponse
{
    public bool EmailSent { get; set; }
    public string Message { get; set; } = "If the email exists, a password reset link has been sent.";
}

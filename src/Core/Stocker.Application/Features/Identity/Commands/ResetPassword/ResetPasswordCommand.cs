using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.ResetPassword;

public record ResetPasswordCommand : IRequest<Result<ResetPasswordResponse>>
{
    public string Token { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
}

public class ResetPasswordResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

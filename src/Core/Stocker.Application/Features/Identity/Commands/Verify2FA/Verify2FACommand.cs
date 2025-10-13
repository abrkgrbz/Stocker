using MediatR;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Verify2FA;

public record Verify2FACommand : IRequest<Result<AuthResponse>>
{
    public string Email { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string? TempToken { get; init; }
    public bool IsBackupCode { get; init; }
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
}

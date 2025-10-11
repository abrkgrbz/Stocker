using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Enable2FA;

public record Enable2FACommand : IRequest<Result<Enable2FAResponse>>
{
    public Guid UserId { get; init; }
    public string VerificationCode { get; init; } = string.Empty;
}

public class Enable2FAResponse
{
    public bool Enabled { get; set; }
    public string Message { get; set; } = string.Empty;
}

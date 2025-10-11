using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Disable2FA;

public record Disable2FACommand : IRequest<Result>
{
    public Guid UserId { get; init; }
    public string VerificationCode { get; init; } = string.Empty;
}

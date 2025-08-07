using MediatR;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.RefreshToken;

public record RefreshTokenCommand : IRequest<Result<AuthResponse>>
{
    public string RefreshToken { get; init; } = string.Empty;
}
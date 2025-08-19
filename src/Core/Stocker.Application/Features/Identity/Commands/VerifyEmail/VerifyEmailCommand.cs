using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.VerifyEmail;

public sealed record VerifyEmailCommand : IRequest<Result<VerifyEmailResponse>>
{
    public string Email { get; init; } = string.Empty;
    public string Token { get; init; } = string.Empty;
}
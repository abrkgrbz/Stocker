using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.ResendVerificationEmail;

public sealed record ResendVerificationEmailCommand : IRequest<Result<ResendVerificationEmailResponse>>
{
    public string Email { get; init; } = string.Empty;
}
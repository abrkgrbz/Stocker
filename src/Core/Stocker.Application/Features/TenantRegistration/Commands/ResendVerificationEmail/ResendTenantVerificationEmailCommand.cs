using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Commands.ResendVerificationEmail;

public sealed record ResendTenantVerificationEmailCommand : IRequest<Result<ResendTenantVerificationEmailResponse>>
{
    public string Email { get; init; } = string.Empty;
}

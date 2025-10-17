using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Commands.VerifyEmail;

public sealed class VerifyTenantEmailCommand : IRequest<Result<bool>>
{
    public string Token { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
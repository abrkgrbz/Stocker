using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.VerifyEmail;

public class VerifyEmailCommand : IRequest<Result<VerifyEmailResponse>>
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}
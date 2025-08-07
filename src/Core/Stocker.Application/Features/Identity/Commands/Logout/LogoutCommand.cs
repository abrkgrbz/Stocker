using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Logout;

public record LogoutCommand : IRequest<Result>
{
    public string UserId { get; init; } = string.Empty;
}
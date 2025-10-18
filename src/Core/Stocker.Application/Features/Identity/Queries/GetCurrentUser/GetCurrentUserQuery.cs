using MediatR;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<Result<UserInfo>>
{
    public Guid UserId { get; init; }
}

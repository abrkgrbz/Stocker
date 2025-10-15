using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.Check2FALockout;

public record Check2FALockoutQuery(string Email) : IRequest<Result<LockoutStatusResponse>>;

public record LockoutStatusResponse
{
    public bool IsLockedOut { get; init; }
    public int? MinutesRemaining { get; init; }
    public int? SecondsRemaining { get; init; }
    public string? Message { get; init; }
}

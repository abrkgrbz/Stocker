using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.SuspendSubscription;

public record SuspendSubscriptionCommand : IRequest<Result<bool>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

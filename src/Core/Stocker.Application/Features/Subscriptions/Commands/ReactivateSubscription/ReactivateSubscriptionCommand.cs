using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.ReactivateSubscription;

public record ReactivateSubscriptionCommand : IRequest<Result<bool>>
{
    public Guid Id { get; init; }
}

using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.CancelSubscription;

public record CancelSubscriptionCommand : IRequest<Result<bool>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}
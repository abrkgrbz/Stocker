using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionHistory;

public record GetSubscriptionHistoryQuery : IRequest<Result<List<SubscriptionHistoryDto>>>
{
    public Guid SubscriptionId { get; init; }
    public int? Limit { get; init; }
}

public record SubscriptionHistoryDto(
    Guid Id,
    string Action,
    string Description,
    string? OldValue,
    string? NewValue,
    string? PerformedBy,
    DateTime Timestamp
);
